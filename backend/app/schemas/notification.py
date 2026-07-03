from datetime import datetime
from typing import Optional, Any
from pydantic import BaseModel
from app.models.models import NotificationType


class NotificationOut(BaseModel):
    id: str
    user_id: str
    type: NotificationType
    title: str
    body: str
    is_read: bool
    meta: Optional[Any] = None
    created_at: datetime

    class Config:
        from_attributes = True