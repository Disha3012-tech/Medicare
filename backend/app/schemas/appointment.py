from datetime import datetime
from datetime import date as date_type
from typing import Optional
from pydantic import BaseModel
from app.models.models import AppointmentStatus, AppointmentType


class EmergencyCancelRequest(BaseModel):
    date: date_type
    reason: str


class AppointmentCreate(BaseModel):
    doctor_id: str
    scheduled_at: datetime
    duration_min: int = 30
    type: AppointmentType = AppointmentType.IN_PERSON
    reason_for_visit: Optional[str] = None


class AppointmentUpdate(BaseModel):
    status: Optional[AppointmentStatus] = None
    scheduled_at: Optional[datetime] = None
    notes: Optional[str] = None
    cancel_reason: Optional[str] = None


class AppointmentOut(BaseModel):
    id: str
    patient_id: str
    doctor_id: str
    scheduled_at: datetime
    duration_min: int
    type: AppointmentType
    status: AppointmentStatus
    reason_for_visit: Optional[str] = None
    notes: Optional[str] = None
    cancel_reason: Optional[str] = None

    class Config:
        from_attributes = True


class CallInfoOut(BaseModel):
    """Everything the video consultation page needs to join a call."""
    room_id: str
    appointment_id: str
    scheduled_at: datetime
    other_participant_name: str
    other_participant_avatar: Optional[str] = None
    other_participant_role: str  # "doctor" | "patient"
    specialty: Optional[str] = None