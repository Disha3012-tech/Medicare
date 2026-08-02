from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.models.models import Doctor, User, Role
from app.schemas.admin import AdminDoctorOut
from app.core.deps import require_roles

router = APIRouter(prefix="/admin", tags=["admin"])


def _serialize(doctor: Doctor) -> AdminDoctorOut:
    return AdminDoctorOut(
        id=doctor.id,
        user_id=doctor.user_id,
        first_name=doctor.user.first_name,
        last_name=doctor.user.last_name,
        email=doctor.user.email,
        specialty=doctor.specialty,
        license_number=doctor.license_number,
        years_experience=doctor.years_experience,
        clinic_name=doctor.clinic_name,
        is_verified=doctor.is_verified,
    )


@router.get("/doctors/pending", response_model=List[AdminDoctorOut])
def list_pending_doctors(
    current_user: User = Depends(require_roles(Role.ADMIN)),
    db: Session = Depends(get_db),
):
    doctors = (
        db.query(Doctor)
        .options(joinedload(Doctor.user))
        .filter(Doctor.is_verified.is_(False))
        .order_by(Doctor.created_at.desc())
        .all()
    )
    return [_serialize(d) for d in doctors]


@router.patch("/doctors/{doctor_id}/verify", response_model=AdminDoctorOut)
def verify_doctor(
    doctor_id: str,
    current_user: User = Depends(require_roles(Role.ADMIN)),
    db: Session = Depends(get_db),
):
    doctor = db.query(Doctor).options(joinedload(Doctor.user)).filter(Doctor.id == doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor not found")

    doctor.is_verified = True
    db.commit()
    db.refresh(doctor)
    return _serialize(doctor)