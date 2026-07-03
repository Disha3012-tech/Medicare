from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from app.models.models import RecordType


class MedicalRecordOut(BaseModel):
    id: str
    patient_id: str
    title: str
    type: RecordType
    file_url: str
    file_name: str
    file_size_kb: Optional[int] = None
    uploaded_at: datetime

    class Config:
        from_attributes = True