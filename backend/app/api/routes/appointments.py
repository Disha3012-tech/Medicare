from datetime import datetime, timedelta, time
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_

from app.core.database import get_db
from app.models.models import (
    Appointment, Doctor, Patient, User, Role, AppointmentStatus, AppointmentType,
    VideoSession, Notification, NotificationType, BlockedDate
)
from app.schemas.appointment import (
    AppointmentCreate, AppointmentUpdate, AppointmentOut, EmergencyCancelRequest, CallInfoOut
)
from app.core.deps import get_current_user, require_roles
from app.ws.manager import manager

router = APIRouter(prefix="/appointments", tags=["appointments"])


def _notify(db: Session, user_id: str, ntype: NotificationType, title: str, body: str, meta: dict = None):
    note = Notification(user_id=user_id, type=ntype, title=title, body=body, meta=meta)
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

    if doctor.is_on_vacation:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This doctor is currently unavailable")

    appt_date = payload.scheduled_at.date()
    blocked = db.query(BlockedDate).filter(
        BlockedDate.doctor_id == doctor.id,
        BlockedDate.date == datetime.combine(appt_date, datetime.min.time()),
    ).first()
    if blocked:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This date is unavailable")

    same_slot_count = db.query(Appointment).filter(
        Appointment.doctor_id == doctor.id,
        Appointment.status.in_([AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED]),
        Appointment.scheduled_at == payload.scheduled_at,
    ).count()
    if same_slot_count >= (doctor.slot_capacity or 1):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="This slot is fully booked")

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
        f"{current_user.first_name} {current_user.last_name} requested a new appointment.",
        meta={"appointment_id": appointment.id, "scheduled_at": payload.scheduled_at.isoformat()},
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


@router.get("/emergency-cancel-day")
def _placeholder_reserved():
    # unreachable — placeholder to keep static route ordering documentation clear;
    # real POST route is declared below with the correct method
    pass


@router.post("/emergency-cancel-day", status_code=status.HTTP_200_OK)
async def emergency_cancel_day(
    payload: EmergencyCancelRequest,
    current_user: User = Depends(require_roles(Role.DOCTOR)),
    db: Session = Depends(get_db),
):
    doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
    if not doctor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor profile not found")

    day_start = datetime.combine(payload.date, time.min)
    day_end = datetime.combine(payload.date, time.max)

    appts = db.query(Appointment).filter(
        Appointment.doctor_id == doctor.id,
        Appointment.status.in_([AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED]),
        Appointment.scheduled_at >= day_start,
        Appointment.scheduled_at <= day_end,
    ).all()

    cancelled_count = 0
    for appt in appts:
        appt.status = AppointmentStatus.CANCELLED
        appt.cancel_reason = f"Emergency cancellation by doctor: {payload.reason}"

        patient = db.query(Patient).filter(Patient.id == appt.patient_id).first()
        if not patient:
            continue

        _notify(
            db, patient.user_id, NotificationType.APPOINTMENT,
            "Appointment cancelled — emergency",
            f"Dr. {current_user.last_name} had to cancel all appointments on {payload.date.strftime('%b %d, %Y')} due to an emergency. Please rebook at your convenience.",
            meta={"appointment_id": appt.id, "doctor_id": doctor.id, "reason": payload.reason, "action": "rebook"},
        )

        await manager.send_to_user(patient.user_id, {
            "event": "appointment:updated",
            "appointmentId": appt.id,
        })
        cancelled_count += 1

    db.commit()
    return {"success": True, "cancelled_count": cancelled_count}


@router.get("/{appointment_id}/call-info", response_model=CallInfoOut)
def get_call_info(
    appointment_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    appt = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")
    _assert_appointment_access(db, appt, current_user)

    if appt.type != AppointmentType.VIDEO:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This is not a video appointment")

    video_session = db.query(VideoSession).filter(VideoSession.appointment_id == appt.id).first()
    if not video_session:
        video_session = VideoSession(appointment_id=appt.id)
        db.add(video_session)
        db.commit()
        db.refresh(video_session)

    doctor = db.query(Doctor).options(joinedload(Doctor.user)).filter(Doctor.id == appt.doctor_id).first()
    patient = db.query(Patient).options(joinedload(Patient.user)).filter(Patient.id == appt.patient_id).first()

    if current_user.role == Role.PATIENT:
        other_name = f"Dr. {doctor.user.first_name} {doctor.user.last_name}"
        other_avatar = doctor.user.avatar_url
        other_role = "doctor"
        specialty = doctor.specialty
    else:
        other_name = f"{patient.user.first_name} {patient.user.last_name}"
        other_avatar = patient.user.avatar_url
        other_role = "patient"
        specialty = None

    return CallInfoOut(
        room_id=video_session.room_id,
        appointment_id=appt.id,
        scheduled_at=appt.scheduled_at,
        other_participant_name=other_name,
        other_participant_avatar=other_avatar,
        other_participant_role=other_role,
        specialty=specialty,
    )

@router.post("/{appointment_id}/start-call", status_code=status.HTTP_200_OK)
async def start_call(
    appointment_id: str,
    current_user: User = Depends(require_roles(Role.DOCTOR)),
    db: Session = Depends(get_db),
):
    appt = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")
    _assert_appointment_access(db, appt, current_user)

    if appt.type != AppointmentType.VIDEO:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This is not a video appointment")

    patient = db.query(Patient).filter(Patient.id == appt.patient_id).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")

    _notify(
        db, patient.user_id, NotificationType.APPOINTMENT,
        "Your doctor started the video call",
        f"Dr. {current_user.last_name} is ready for your video consultation. Join now.",
        meta={"appointment_id": appt.id, "action": "join_call"},
    )
    db.commit()

    await manager.send_to_user(patient.user_id, {
        "event": "call:started",
        "appointmentId": appt.id,
    })

    return {"success": True}

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

    doctor = db.query(Doctor).filter(Doctor.id == appt.doctor_id).first()
    patient = db.query(Patient).filter(Patient.id == appt.patient_id).first()
    other_user_id = patient.user_id if current_user.role == Role.DOCTOR else doctor.user_id

    _notify(
        db, other_user_id, NotificationType.APPOINTMENT,
        "Appointment updated",
        f"Your appointment status is now {appt.status.value}.",
        meta={"appointment_id": appt.id, "scheduled_at": appt.scheduled_at.isoformat(), "status": appt.status.value},
    )
    db.commit()

    await manager.send_to_user(other_user_id, {"event": "appointment:updated", "appointmentId": appt.id})

    return appt