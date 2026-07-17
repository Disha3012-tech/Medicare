from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.core.security import decode_token
from app.models.models import Message, User, VideoSession, Appointment, Doctor, Patient
from app.ws.manager import manager

router = APIRouter(tags=["websocket"])


def _authenticate_ws(token: str) -> str | None:
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        return None
    return payload.get("sub")


@router.websocket("/ws/notifications")
async def notifications_ws(websocket: WebSocket, token: str = Query(...)):
    """General-purpose socket: delivers appointment/prescription/notification pushes."""
    user_id = _authenticate_ws(token)
    if not user_id:
        await websocket.close(code=4001)
        return

    await manager.connect(user_id, websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(user_id, websocket)


@router.websocket("/ws/chat")
async def chat_ws(websocket: WebSocket, token: str = Query(...)):
    """Bidirectional chat socket. Client sends {"receiver_id": ..., "content": ...}."""
    user_id = _authenticate_ws(token)
    if not user_id:
        await websocket.close(code=4001)
        return

    await manager.connect(user_id, websocket)
    db: Session = SessionLocal()
    try:
        while True:
            data = await websocket.receive_json()
            receiver_id = data.get("receiver_id")
            content = data.get("content")
            if not receiver_id or not content:
                continue

            message = Message(sender_id=user_id, receiver_id=receiver_id, content=content)
            db.add(message)
            db.commit()
            db.refresh(message)

            payload = {
                "event": "message:new",
                "id": message.id,
                "sender_id": message.sender_id,
                "receiver_id": message.receiver_id,
                "content": message.content,
                "created_at": message.created_at.isoformat(),
            }
            await manager.send_to_user(receiver_id, payload)
            await manager.send_to_user(user_id, payload)
    except WebSocketDisconnect:
        manager.disconnect(user_id, websocket)
    finally:
        db.close()


@router.websocket("/ws/video/{room_id}")
async def video_signaling_ws(websocket: WebSocket, room_id: str, token: str = Query(...)):
    """Relays WebRTC signaling (and in-call chat) between exactly the two
    participants authorized for this specific video room."""
    user_id = _authenticate_ws(token)
    if not user_id:
        await websocket.close(code=4001)
        return

    # Verify this user is actually the patient or doctor on the appointment
    # behind this room — without this, anyone with a valid token could join
    # any call by guessing/enumerating room_id values.
    db: Session = SessionLocal()
    try:
        video_session = db.query(VideoSession).filter(VideoSession.room_id == room_id).first()
        if not video_session:
            await websocket.close(code=4004)
            return
        appt = db.query(Appointment).filter(Appointment.id == video_session.appointment_id).first()
        if not appt:
            await websocket.close(code=4004)
            return
        doctor = db.query(Doctor).filter(Doctor.id == appt.doctor_id).first()
        patient = db.query(Patient).filter(Patient.id == appt.patient_id).first()
        allowed_user_ids = {doctor.user_id if doctor else None, patient.user_id if patient else None}
        if user_id not in allowed_user_ids:
            await websocket.close(code=4003)
            return
    finally:
        db.close()

    key = f"room:{room_id}"
    await manager.connect(key, websocket)
    try:
        while True:
            data = await websocket.receive_json()
            for ws in manager.active.get(key, []):
                if ws is not websocket:
                    await ws.send_json(data)
    except WebSocketDisconnect:
        manager.disconnect(key, websocket)