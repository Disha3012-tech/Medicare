from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel
from app.models.models import Gender


class EmergencyContactIn(BaseModel):
    name: str
    relationship: str
    phone: str
    email: Optional[str] = None


class EmergencyContactOut(BaseModel):
    name: str
    relationship: str
    phone: str
    email: Optional[str] = None

    class Config:
        from_attributes = True


class InsuranceInfoIn(BaseModel):
    provider: str
    policy_number: str
    group_number: Optional[str] = None
    valid_until: Optional[datetime] = None


class InsuranceInfoOut(BaseModel):
    provider: str
    policy_number: str
    group_number: Optional[str] = None
    valid_until: Optional[datetime] = None

    class Config:
        from_attributes = True


class PatientUpdate(BaseModel):
    date_of_birth: Optional[datetime] = None
    gender: Optional[Gender] = None
    blood_group: Optional[str] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    allergies: Optional[List[str]] = None
    chronic_conditions: Optional[List[str]] = None


class PatientOut(BaseModel):
    id: str
    user_id: str
    date_of_birth: Optional[datetime] = None
    gender: Optional[Gender] = None
    blood_group: Optional[str] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    allergies: List[str] = []
    chronic_conditions: List[str] = []

    class Config:
        from_attributes = True


class PatientSummaryOut(BaseModel):
    """Used by GET /doctors/me/patients — a doctor's view of their patients."""
    id: str
    user_id: str
    name: str
    age: Optional[int] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    phone: Optional[str] = None
    email: str
    chronic_conditions: List[str] = []
    allergies: List[str] = []
    last_visit: Optional[datetime] = None
    next_visit: Optional[datetime] = None
    visit_count: int
    current_medications: List[str] = []
    avatar_url: Optional[str] = None

    class Config:
        from_attributes = True