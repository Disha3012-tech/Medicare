from typing import Optional
from pydantic import BaseModel, EmailStr


class AdminDoctorOut(BaseModel):
    id: str
    user_id: str
    first_name: str
    last_name: str
    email: EmailStr
    specialty: str
    license_number: str
    years_experience: int
    clinic_name: Optional[str] = None
    is_verified: bool

    class Config:
        from_attributes = True