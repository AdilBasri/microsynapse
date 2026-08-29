from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional
from services.mail_processor import process_mails

app = FastAPI()

class MailRequest(BaseModel):
    credentials: dict
    start_date: str
    user_id: Optional[str] = None
    userId: Optional[str] = None

@app.get("/status")
def status():
    return {"status": "AI Mail Processing API is running"}

@app.post("/process-mails")
def process_user_mails(request: MailRequest):
    uid = request.user_id or request.userId
    count = process_mails(request.credentials, request.start_date, user_id=uid)
    if count == 0:
        return {"status": "empty", "message": "Mailinize bağlı abonelik bulunamadı.", "count": 0}
    return {"status": "success", "message": f"{count} abonelik bulundu.", "count": count}
