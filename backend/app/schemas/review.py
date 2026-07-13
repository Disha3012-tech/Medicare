from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class ReviewCreate(BaseModel):
    appointment_id: str
    rating: int = Field(ge=1, le=5)
    comment: Optional[str] = None


class ReviewOut(BaseModel):
    id: str
    appointment_id: str
    patient_id: str
    doctor_id: str
    rating: int
    comment: Optional[str] = None
    created_at: datetime
    patient_name: str

    class Config:
        from_attributes = True

class ReviewAnonymizedOut(BaseModel):
    id: str
    rating: int
    comment: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True