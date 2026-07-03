from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.core.security import decode_token
from app.models.models import Message, User
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
            # Client doesn't need to send anything; just keep the connection alive.
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
            await manager.send_to_user(user_id, payload)  # echo back to sender's other tabs
    except WebSocketDisconnect:
        manager.disconnect(user_id, websocket)
    finally:
        db.close()


@router.websocket("/ws/video/{room_id}")
async def video_signaling_ws(websocket: WebSocket, room_id: str, token: str = Query(...)):
    """Relays WebRTC SDP/ICE signaling messages between the two participants in a room."""
    user_id = _authenticate_ws(token)
    if not user_id:
        await websocket.close(code=4001)
        return

    key = f"room:{room_id}"
    await manager.connect(key, websocket)
    try:
        while True:
            data = await websocket.receive_json()
            # broadcast to everyone else in the room (offer/answer/ice-candidate)
            for ws in manager.active.get(key, []):
                if ws is not websocket:
                    await ws.send_json(data)
    except WebSocketDisconnect:
        manager.disconnect(key, websocket)