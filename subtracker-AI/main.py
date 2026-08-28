from fastapi import FastAPI
from pydantic import BaseModel
from services.mail_processor import process_mails

app = FastAPI()

class MailRequest(BaseModel):
    credentials: dict
    start_date: str

@app.post("/process-mails")
def process_user_mails(request: MailRequest):
    count = process_mails(request.credentials, request.start_date)
    return {"message": f"{count} adet mail işlendi ve veritabanına kaydedildi."}
