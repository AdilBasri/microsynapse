import json
import os
import torch
from torch.utils.data import Dataset, DataLoader
from transformers import AutoModelForSequenceClassification, AutoTokenizer, AutoConfig
from torch.optim import AdamW
from sklearn.model_selection import train_test_split

MODEL_NAME = "dbmdz/bert-base-turkish-cased"
DATA_PATH = "data/mail1.json" if os.path.exists("data/mail1.json") else "mail1.json"
OUTPUT_PATH = "models/bert_model.pt"
NUM_LABELS = 3
EPOCHS = 4
BATCH_SIZE = 8
LR = 2e-5

with open(DATA_PATH, "r", encoding="utf-8") as f:
    data = json.load(f)

texts = [d["text"] for d in data]
labels = [d["label"] for d in data]

train_texts, val_texts, train_labels, val_labels = train_test_split(
    texts, labels, test_size=0.15, random_state=42, stratify=labels
)

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)

class MailDataset(Dataset):
    def __init__(self, texts, labels):
        self.texts, self.labels = texts, labels
    def __len__(self):
        return len(self.texts)
    def __getitem__(self, idx):
        enc = tokenizer(self.texts[idx], truncation=True, padding="max_length", max_length=256, return_tensors="pt")
        item = {k: v.squeeze(0) for k, v in enc.items()}
        item["labels"] = torch.tensor(self.labels[idx])
        return item

train_loader = DataLoader(MailDataset(train_texts, train_labels), batch_size=BATCH_SIZE, shuffle=True)
val_loader = DataLoader(MailDataset(val_texts, val_labels), batch_size=BATCH_SIZE)

if torch.backends.mps.is_available():
    device = torch.device("mps")
elif torch.cuda.is_available():
    device = torch.device("cuda")
else:
    device = torch.device("cpu")

print(f"Training on device: {device}")

config = AutoConfig.from_pretrained(MODEL_NAME, num_labels=NUM_LABELS)
model = AutoModelForSequenceClassification.from_pretrained(MODEL_NAME, config=config).to(device)
optimizer = AdamW(model.parameters(), lr=LR)

best_acc = 0.0

for epoch in range(EPOCHS):
    model.train()
    total_loss = 0
    for batch in train_loader:
        batch = {k: v.to(device) for k, v in batch.items()}
        loss = model(**batch).loss
        loss.backward()
        optimizer.step()
        optimizer.zero_grad()
        total_loss += loss.item()
    print(f"Epoch {epoch+1}: train loss {total_loss/len(train_loader):.4f}")

    model.eval()
    correct, total = 0, 0
    with torch.no_grad():
        for batch in val_loader:
            batch = {k: v.to(device) for k, v in batch.items()}
            preds = torch.argmax(model(**batch).logits, dim=1)
            correct += (preds == batch["labels"]).sum().item()
            total += len(batch["labels"])
    val_acc = correct / total
    print(f"  Val accuracy: {val_acc:.3f}")

    if val_acc > best_acc:
        best_acc = val_acc
        os.makedirs("models", exist_ok=True)
        torch.save({"model_state_dict": model.state_dict()}, OUTPUT_PATH)
        print(f"  → Yeni en iyi model kaydedildi (val_acc: {val_acc:.3f})")

print(f"\nEğitim tamamlandı. En iyi val accuracy: {best_acc:.3f}")
print("Kaydedildi:", OUTPUT_PATH)
