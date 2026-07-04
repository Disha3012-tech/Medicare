from datetime import datetime, timedelta
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_

from app.core.database import get_db
from app.models.models import (
    Appointment, Doctor, Patient, User, Role, AppointmentStatus, VideoSession, Notification, NotificationType
)
from app.schemas.appointment import AppointmentCreate, AppointmentUpdate, AppointmentOut
from app.core.deps import get_current_user, require_roles
from app.ws.manager import manager

router = APIRouter(prefix="/appointments", tags=["appointments"])


def _notify(db: Session, user_id: str, ntype: NotificationType, title: str, body: str):
    note = Notification(user_id=user_id, type=ntype, title=title, body=body)
    db.add(note)
    db.flush()
    return note


@router.post("", response_model=AppointmentOut, status_code=status.HTTP_201_CREATED)
async def book_appointment(
    payload: AppointmentCreate,
    current_user: User = Depends(require_roles(Role.PATIENT)),
    db: Session = Depends(get_db),
    
):
    patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
    doctor = db.query(Doctor).filter(Doctor.id == payload.doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor not found")

    # Prevent double-booking: overlapping active appointment for same doctor
    window_end = payload.scheduled_at + timedelta(minutes=payload.duration_min)
    conflict = db.query(Appointment).filter(
        Appointment.doctor_id == doctor.id,
        Appointment.status.in_([AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED]),
        Appointment.scheduled_at < window_end,
        Appointment.scheduled_at + timedelta(minutes=1) * Appointment.duration_min > payload.scheduled_at,
    ).first()
    if conflict:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="This slot is no longer available")

    appointment = Appointment(
        patient_id=patient.id,
        doctor_id=doctor.id,
        scheduled_at=payload.scheduled_at,
        duration_min=payload.duration_min,
        type=payload.type,
        reason_for_visit=payload.reason_for_visit,
    )
    db.add(appointment)
    db.flush()

    if payload.type.value == "VIDEO":
        db.add(VideoSession(appointment_id=appointment.id))

    _notify(
        db, doctor.user_id, NotificationType.APPOINTMENT,
        "New appointment request",
        f"{current_user.first_name} {current_user.last_name} requested an appointment on {payload.scheduled_at.strftime('%b %d, %Y %I:%M %p')}",
    )

    db.commit()
    db.refresh(appointment)

    await manager.send_to_user(doctor.user_id, {
        "event": "appointment:new",
        "appointmentId": appointment.id,
    })

    return appointment


@router.get("/mine", response_model=List[AppointmentOut])
def list_my_appointments(
    status_filter: Optional[AppointmentStatus] = Query(None, alias="status"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Appointment)
    if current_user.role == Role.PATIENT:
        patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
        query = query.filter(Appointment.patient_id == patient.id)
    elif current_user.role == Role.DOCTOR:
        doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
        query = query.filter(Appointment.doctor_id == doctor.id)

    if status_filter:
        query = query.filter(Appointment.status == status_filter)

    return query.order_by(Appointment.scheduled_at.desc()).all()


@router.get("/{appointment_id}", response_model=AppointmentOut)
def get_appointment(
    appointment_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    appt = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")
    _assert_appointment_access(db, appt, current_user)
    return appt


@router.patch("/{appointment_id}", response_model=AppointmentOut)
async def update_appointment(
    appointment_id: str,
    payload: AppointmentUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    appt = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")
    _assert_appointment_access(db, appt, current_user)

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(appt, field, value)

    db.commit()
    db.refresh(appt)

    # Notify the other party of status change
    doctor = db.query(Doctor).filter(Doctor.id == appt.doctor_id).first()
    patient = db.query(Patient).filter(Patient.id == appt.patient_id).first()
    other_user_id = patient.user_id if current_user.role == Role.DOCTOR else doctor.user_id

    _notify(
        db, other_user_id, NotificationType.APPOINTMENT,
        "Appointment updated",
        f"Your appointment on {appt.scheduled_at.strftime('%b %d, %Y %I:%M %p')} is now {appt.status.value}",
    )
    db.commit()

    await manager.send_to_user(other_user_id, {"event": "appointment:updated", "appointmentId": appt.id})

    return appt


def _assert_appointment_access(db: Session, appt: Appointment, user: User):
    if user.role == Role.ADMIN:
        return
    if user.role == Role.PATIENT:
        patient = db.query(Patient).filter(Patient.user_id == user.id).first()
        if not patient or appt.patient_id != patient.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your appointment")
    if user.role == Role.DOCTOR:
        doctor = db.query(Doctor).filter(Doctor.user_id == user.id).first()
        if not doctor or appt.doctor_id != doctor.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your appointment")