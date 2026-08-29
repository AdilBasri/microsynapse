import base64
import re
import torch
import time
import threading
import httplib2
from google_auth_httplib2 import AuthorizedHttp
from bs4 import BeautifulSoup
from transformers import AutoConfig, AutoModelForSequenceClassification, AutoTokenizer
from pymongo import MongoClient, InsertOne
from services.auth import gmail_authenticate
from concurrent.futures import ThreadPoolExecutor, as_completed
from requests.exceptions import RequestException
from datetime import datetime
import statistics
from dateutil import parser
from bson.objectid import ObjectId

_thread_local = threading.local()

def get_thread_service(base_credentials):
    if not hasattr(_thread_local, "service"):
        from googleapiclient.discovery import build
        authed_http = AuthorizedHttp(base_credentials, http=httplib2.Http(timeout=30))
        _thread_local.service = build('gmail', 'v1', http=authed_http)
    return _thread_local.service


# ==== Performans İzleme ====
performance_stats = {
    "api_request_times": [],
    "mail_fetch_times": [],
    "mail_filtering_times": [],
    "html_processing_times": [],
    "model_prediction_times": [],
    "total_processing_time": 0
}

def log_performance(stage, start_time):
    duration = time.time() - start_time
    if stage in performance_stats:
        performance_stats[stage].append(duration)
    return duration

# ==== Regex Patternleri ====
date_pattern = r"\b\d{1,2}[./-]\d{1,2}[./-]\d{2,4}\b|\b\d{1,2} [A-Za-zçğıöşüÇĞİÖŞÜ]+ \d{4}\b"
price_pattern = r"(?:₺|TL|TRY|USD|\$|€|tl|try|usd|eur)\s?\d{1,3}(?:[.,]\d{2})?|\d{1,3}(?:[.,]\d{2})?\s?(?:₺|TL|TRY|USD|\$|€|tl|try|usd|eur)"

# ==== Model ve Tokenizer Yükleme ====
config = AutoConfig.from_pretrained("dbmdz/bert-base-turkish-cased", num_labels=3)
model = AutoModelForSequenceClassification.from_config(config)
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
try:
    checkpoint = torch.load("models/bert_model.pt", map_location=device, weights_only=False)
    model.load_state_dict(checkpoint['model_state_dict'], strict=False)
    print("BERT model weights loaded successfully from models/bert_model.pt")
except Exception as e:
    print(f"Warning: Could not load models/bert_model.pt ({e}). Using base pretrained model as fallback.")

model.to(device)
model.eval()
tokenizer = AutoTokenizer.from_pretrained("dbmdz/bert-base-turkish-cased")

import os
from dotenv import load_dotenv
load_dotenv()

# ==== MongoDB Bağlantısı ====
mongo_uri = os.getenv("MONGO_URI") or os.getenv("AI_MONGO_URI")
client = MongoClient(mongo_uri)
try:
    db = client.get_default_database()
except Exception:
    db = client["subtracker"]
collection = db["mails"]

label_map = {0: "Abonelik Değil", 1: "Abonelik Başlangıcı", 2: "Abonelik Bitişi"}
subscription_keywords = [
    "abonelik", "üyelik", "üyeliğiniz", "aboneliğiniz",
    "başladı", "başlatıldı", "iptal", "bitti", "sona erdi",
    "yenilendi", "yenileme", "bitirildi", "kapanmıştır",
    "premium", "paketiniz", "faturanız", "ödeme", "planınız"
]

def contains_subscription_keywords(text):
    text = text.lower()
    return any(keyword in text for keyword in subscription_keywords)

def detect_subscription_period(body_text):
    body_text = body_text.lower()
    aylik_keywords = ["aylık", "her ay", "monthly", "per month", "1 month", "30 günlük"]
    yillik_keywords = ["yıllık", "her yıl", "annual", "per year", "12 months", "365 günlük"]
    for keyword in yillik_keywords:
        if keyword in body_text:
            return "Yıllık"
    for keyword in aylik_keywords:
        if keyword in body_text:
            return "Aylık"
    return "Bilinmiyor"

def extract_info(text):
    dates = re.findall(date_pattern, text)
    prices = re.findall(price_pattern, text)
    return {
        "dates": dates if dates else None,
        "prices": prices if prices else None
    }

def predict_mail(text):
    model_start = time.time()
    inputs = tokenizer(text, return_tensors="pt", padding=True, truncation=True, max_length=256).to(device)
    with torch.no_grad():
        outputs = model(**inputs)
        prediction = torch.argmax(outputs.logits, dim=1).item()
    log_performance("model_prediction_times", model_start)
    return prediction

def parse_from_field(from_field):
    if "<" in from_field and ">" in from_field:
        company_name = from_field.split("<")[0].strip()
        mail_address = from_field.split("<")[1].replace(">", "").strip()
    else:
        company_name = from_field.split("@")[0]
        mail_address = from_field.strip()
    return company_name, mail_address

def remove_urls(text):
    return re.sub(r'https?://\S+|www\.\S+', '', text)

def get_emails(service, start_date):
    query = f"after:{start_date}"
    mails = []
    next_page_token = None

    while True:
        request_kwargs = {
            'userId': 'me',
            'q': query,
            'maxResults': 500
        }
        if next_page_token:
            request_kwargs['pageToken'] = next_page_token

        try:
            results = service.users().messages().list(**request_kwargs).execute()
        except RequestException as e:
            print(f"Request failed: {e}")
            time.sleep(5)
            continue

        messages = results.get('messages', [])
        next_page_token = results.get('nextPageToken')
        mails.extend(messages)

        if not next_page_token:
            break

    return mails

def fetch_single_mail(creds_or_service, msg_id):
    fetch_start = time.time()
    try:
        if hasattr(creds_or_service, "token"):
            service = get_thread_service(creds_or_service)
        else:
            service = creds_or_service
        message = service.users().messages().get(userId='me', id=msg_id).execute()
        log_performance("mail_fetch_times", fetch_start)
        return message
    except Exception as e:
        print(f"Fetch error ({msg_id}): {e}")
        log_performance("mail_fetch_times", fetch_start)
        return None

def process_single_mail(txt):
    try:
        payload = txt['payload']
        headers = payload['headers']

        subject = next((h['value'] for h in headers if h['name'] == 'Subject'), "")
        sender = next((h['value'] for h in headers if h['name'] == 'From'), "")

        parts = payload.get('parts')
        data = None
        if parts:
            for part in parts:
                if part['mimeType'] == 'text/plain':
                    data = part['body'].get('data')
                    break
            if not data and parts:
                data = parts[0]['body'].get('data')
        else:
            data = payload['body'].get('data')

        if not data:
            return None

        decoded_data = base64.urlsafe_b64decode(data).decode('utf-8', errors='ignore')
        if not contains_subscription_keywords(decoded_data):
            return None

        html_start = time.time()
        soup = BeautifulSoup(decoded_data, "html.parser")
        body = soup.get_text()
        body = remove_urls(body)
        log_performance("html_processing_times", html_start)

        extracted = extract_info(body)
        subscription_period = detect_subscription_period(body)
        prediction = predict_mail(body)

        return {
            'from': sender,
            'found_dates': extracted['dates'],
            'found_prices': extracted['prices'],
            'subscription_status': prediction,
            'subscription_period': subscription_period
        }
    except Exception as e:
        print(f"Process error: {e}")
        return None

def save_to_mongodb(emails, user_email, user_id=None):
    operations = []
    user_obj_id = ObjectId(str(user_id)) if (user_id and ObjectId.is_valid(str(user_id))) else None
    for mail in emails:
        if mail is None:
            continue
        company_name, _ = parse_from_field(mail['from'])
        raw_date = mail['found_dates'][0] if mail['found_dates'] else None
        parsed_date = None
        if raw_date:
            try:
                parsed_date = parser.parse(raw_date, dayfirst=True)
            except Exception:
                parsed_date = None
        document = {
            "userId": user_obj_id,
            "mail_address": user_email,
            "company_name": company_name,
            "price": mail['found_prices'][0] if mail['found_prices'] else None,
            "date": parsed_date,
            "mail_type": label_map[mail['subscription_status']],
            "aylık_yıllık": mail['subscription_period']
        }
        operations.append(InsertOne(document))

    if operations:
        collection.bulk_write(operations)

def process_mails(credentials: dict, start_date: str, user_id: str = None):
    for key in performance_stats:
        if isinstance(performance_stats[key], list):
            performance_stats[key] = []
        else:
            performance_stats[key] = 0

    total_start = time.time()
    print(f"\n===== YENİ İŞLEM BAŞLADI: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} =====")

    print("1: gmail_authenticate çağrılıyor...")
    service, creds = gmail_authenticate(credentials)
    print("2: authenticate tamamlandı, getProfile çağrılıyor...")
    profile = service.users().getProfile(userId='me').execute()
    print("3: getProfile tamamlandı, email:", profile['emailAddress'])
    user_email = profile['emailAddress']

    messages = get_emails(service, start_date)
    print("4: get_emails tamamlandı, mesaj sayısı:", len(messages))
    msg_ids = [msg['id'] for msg in messages]

    print("5: Mailler paralel çekiliyor (thread-safe, 5 workers)...")
    with ThreadPoolExecutor(max_workers=5) as executor:
        fetched_mails = list(executor.map(lambda mid: fetch_single_mail(creds, mid), msg_ids))
    print(f"6: {len(fetched_mails)} mail çekildi, sınıflandırma başlatılıyor...")
    processed_mails = []
    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = [executor.submit(process_single_mail, mail) for mail in fetched_mails if mail]
        for future in as_completed(futures):
            result = future.result()
            if result:
                processed_mails.append(result)

    save_to_mongodb(processed_mails, user_email, user_id=user_id)
    performance_stats["total_processing_time"] = time.time() - total_start

    print(f"Toplam işlem süresi: {performance_stats['total_processing_time']:.2f} saniye")
    if performance_stats["model_prediction_times"]:
        print(f"Ortalama model tahmin süresi: {statistics.mean(performance_stats['model_prediction_times']):.4f} saniye")
    print("===== İŞLEM TAMAMLANDI =====\n")
    return len(processed_mails)
