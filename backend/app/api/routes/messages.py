from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, func

from app.core.database import get_db
from app.models.models import Message, User, Notification, NotificationType
from app.schemas.message import MessageCreate, MessageOut
from app.core.deps import get_current_user
from app.ws.manager import manager

router = APIRouter(prefix="/messages", tags=["messages"])


@router.post("", response_model=MessageOut, status_code=status.HTTP_201_CREATED)
async def send_message(
    payload: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    receiver = db.query(User).filter(User.id == payload.receiver_id).first()
    if not receiver:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recipient not found")
    if receiver.id == current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot message yourself")

    message = Message(
        sender_id=current_user.id,
        receiver_id=receiver.id,
        content=payload.content,
    )
    db.add(message)

    # Only notify if the receiver isn't already watching an open chat socket
    if not manager.is_online(receiver.id):
        db.add(Notification(
            user_id=receiver.id,
            type=NotificationType.MESSAGE,
            title="New message",
            body=f"{current_user.first_name} {current_user.last_name}: {payload.content[:80]}",
        ))

    db.commit()
    db.refresh(message)

    await manager.send_to_user(receiver.id, {
        "event": "message:new",
        "id": message.id,
        "sender_id": message.sender_id,
        "receiver_id": message.receiver_id,
        "content": message.content,
        "created_at": message.created_at.isoformat(),
    })

    return message


@router.get("/thread/{other_user_id}", response_model=List[MessageOut])
def get_thread(
    other_user_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    messages = db.query(Message).filter(
        or_(
            and_(Message.sender_id == current_user.id, Message.receiver_id == other_user_id),
            and_(Message.sender_id == other_user_id, Message.receiver_id == current_user.id),
        )
    ).order_by(Message.created_at.asc()).all()

    # mark incoming messages as read
    db.query(Message).filter(
        Message.sender_id == other_user_id,
        Message.receiver_id == current_user.id,
        Message.is_read.is_(False),
    ).update({"is_read": True})
    db.commit()

    return messages


@router.get("/conversations")
def list_conversations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Returns the latest message with each conversation partner, plus unread counts."""
    partner_ids = db.query(Message.receiver_id).filter(Message.sender_id == current_user.id).union(
        db.query(Message.sender_id).filter(Message.receiver_id == current_user.id)
    ).all()
    partner_ids = {row[0] for row in partner_ids}

    conversations = []
    for partner_id in partner_ids:
        last_msg = db.query(Message).filter(
            or_(
                and_(Message.sender_id == current_user.id, Message.receiver_id == partner_id),
                and_(Message.sender_id == partner_id, Message.receiver_id == current_user.id),
            )
        ).order_by(Message.created_at.desc()).first()

        unread_count = db.query(func.count(Message.id)).filter(
            Message.sender_id == partner_id,
            Message.receiver_id == current_user.id,
            Message.is_read.is_(False),
        ).scalar()

        partner = db.query(User).filter(User.id == partner_id).first()

        conversations.append({
            "partner_id": partner_id,
            "partner_name": f"{partner.first_name} {partner.last_name}" if partner else "Unknown",
            "last_message": last_msg.content if last_msg else None,
            "last_message_at": last_msg.created_at if last_msg else None,
            "unread_count": unread_count,
        })

    conversations.sort(key=lambda c: c["last_message_at"] or "", reverse=True)
    return conversations