from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


class QualificationIn(BaseModel):
    degree: str
    institution: str
    year: int


class QualificationOut(BaseModel):
    id: str
    degree: str
    institution: str
    year: int

    class Config:
        from_attributes = True


class AvailabilitySlotIn(BaseModel):
    day_of_week: int = Field(ge=0, le=6)
    start_time: str
    end_time: str
    slot_minutes: int = 30
    is_active: bool = True


class AvailabilitySlotOut(AvailabilitySlotIn):
    id: str

    class Config:
        from_attributes = True


class BlockedDateIn(BaseModel):
    date: str  # "YYYY-MM-DD"
    reason: Optional[str] = None


class BlockedDateOut(BaseModel):
    id: str
    date: datetime
    reason: Optional[str] = None

    class Config:
        from_attributes = True


class VacationModeIn(BaseModel):
    is_on_vacation: bool


class DoctorUpdate(BaseModel):
    specialty: Optional[str] = None
    license_number: Optional[str] = None
    years_experience: Optional[int] = None
    bio: Optional[str] = None
    consultation_fee: Optional[float] = None
    clinic_name: Optional[str] = None
    clinic_address: Optional[str] = None
    clinic_city: Optional[str] = None
    clinic_state: Optional[str] = None


class DoctorOut(BaseModel):
    id: str
    user_id: str
    specialty: str
    license_number: str
    years_experience: int
    bio: Optional[str] = None
    consultation_fee: float
    clinic_name: Optional[str] = None
    clinic_address: Optional[str] = None
    clinic_city: Optional[str] = None
    clinic_state: Optional[str] = None
    is_verified: bool
    average_rating: float
    total_reviews: int
    first_name: str
    last_name: str
    avatar_url: Optional[str] = None
    is_on_vacation: bool = False

    class Config:
        from_attributes = True