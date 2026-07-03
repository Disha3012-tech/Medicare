from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.models.models import Review, Appointment, Doctor, Patient, User, Role, AppointmentStatus
from app.schemas.review import ReviewCreate, ReviewOut
from app.core.deps import require_roles

router = APIRouter(prefix="/reviews", tags=["reviews"])


@router.post("", response_model=ReviewOut, status_code=status.HTTP_201_CREATED)
def create_review(
    payload: ReviewCreate,
    current_user: User = Depends(require_roles(Role.PATIENT)),
    db: Session = Depends(get_db),
):
    patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
    appt = db.query(Appointment).filter(Appointment.id == payload.appointment_id).first()

    if not appt or appt.patient_id != patient.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")
    if appt.status != AppointmentStatus.COMPLETED:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Can only review completed appointments")

    existing = db.query(Review).filter(Review.appointment_id == appt.id).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Appointment already reviewed")

    review = Review(
        appointment_id=appt.id,
        patient_id=patient.id,
        doctor_id=appt.doctor_id,
        rating=payload.rating,
        comment=payload.comment,
    )
    db.add(review)
    db.flush()

    # Recompute doctor's aggregate rating
    doctor = db.query(Doctor).filter(Doctor.id == appt.doctor_id).first()
    agg = db.query(func.avg(Review.rating), func.count(Review.id)).filter(
        Review.doctor_id == doctor.id
    ).first()
    doctor.average_rating = round(float(agg[0] or 0), 2)
    doctor.total_reviews = agg[1] or 0

    db.commit()
    db.refresh(review)
    return review


@router.get("/doctor/{doctor_id}", response_model=List[ReviewOut])
def list_doctor_reviews(doctor_id: str, db: Session = Depends(get_db)):
    return db.query(Review).filter(Review.doctor_id == doctor_id).order_by(Review.created_at.desc()).all()