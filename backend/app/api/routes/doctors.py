from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.models.models import Doctor, User, Role, Qualification, AvailabilitySlot
from app.schemas.doctor import (
    DoctorOut, DoctorUpdate, QualificationIn, AvailabilitySlotIn, AvailabilitySlotOut
)
from app.core.deps import get_current_user, require_roles

router = APIRouter(prefix="/doctors", tags=["doctors"])


@router.get("", response_model=List[DoctorOut])
def list_doctors(
    specialty: Optional[str] = None,
    city: Optional[str] = None,
    min_rating: Optional[float] = Query(None, ge=0, le=5),
    search: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Doctor).join(User).filter(Doctor.is_verified.is_(True))
    if specialty:
        query = query.filter(Doctor.specialty.ilike(f"%{specialty}%"))
    if city:
        query = query.filter(Doctor.clinic_city.ilike(f"%{city}%"))
    if min_rating is not None:
        query = query.filter(Doctor.average_rating >= min_rating)
    if search:
        query = query.filter(
            (User.first_name.ilike(f"%{search}%")) | (User.last_name.ilike(f"%{search}%"))
        )
    return query.all()


@router.get("/{doctor_id}", response_model=DoctorOut)
def get_doctor(doctor_id: str, db: Session = Depends(get_db)):
    doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor not found")
    return doctor


@router.patch("/me", response_model=DoctorOut)
def update_my_profile(
    payload: DoctorUpdate,
    current_user: User = Depends(require_roles(Role.DOCTOR)),
    db: Session = Depends(get_db),
):
    doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
    if not doctor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor profile not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(doctor, field, value)

    db.commit()
    db.refresh(doctor)
    return doctor


@router.post("/me/qualifications", status_code=status.HTTP_201_CREATED)
def add_qualification(
    payload: QualificationIn,
    current_user: User = Depends(require_roles(Role.DOCTOR)),
    db: Session = Depends(get_db),
):
    doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
    if not doctor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor profile not found")

    qualification = Qualification(doctor_id=doctor.id, **payload.model_dump())
    db.add(qualification)
    db.commit()
    return {"success": True, "id": qualification.id}


@router.get("/{doctor_id}/availability", response_model=List[AvailabilitySlotOut])
def get_availability(doctor_id: str, db: Session = Depends(get_db)):
    return db.query(AvailabilitySlot).filter(
        AvailabilitySlot.doctor_id == doctor_id, AvailabilitySlot.is_active.is_(True)
    ).all()


@router.put("/me/availability", response_model=List[AvailabilitySlotOut])
def set_my_availability(
    slots: List[AvailabilitySlotIn],
    current_user: User = Depends(require_roles(Role.DOCTOR)),
    db: Session = Depends(get_db),
):
    doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
    if not doctor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor profile not found")

    # Replace existing weekly availability wholesale
    db.query(AvailabilitySlot).filter(AvailabilitySlot.doctor_id == doctor.id).delete()
    new_slots = [AvailabilitySlot(doctor_id=doctor.id, **slot.model_dump()) for slot in slots]
    db.add_all(new_slots)
    db.commit()

    return db.query(AvailabilitySlot).filter(AvailabilitySlot.doctor_id == doctor.id).all()