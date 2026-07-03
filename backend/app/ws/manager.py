from typing import Dict, List
from fastapi import WebSocket


class ConnectionManager:
    """Tracks active WebSocket connections keyed by user_id.
    A user may have multiple connections (e.g. multiple tabs/devices)."""

    def __init__(self):
        self.active: Dict[str, List[WebSocket]] = {}

    async def connect(self, user_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active.setdefault(user_id, []).append(websocket)

    def disconnect(self, user_id: str, websocket: WebSocket):
        if user_id in self.active:
            if websocket in self.active[user_id]:
                self.active[user_id].remove(websocket)
            if not self.active[user_id]:
                del self.active[user_id]

    async def send_to_user(self, user_id: str, message: dict):
        for ws in self.active.get(user_id, []):
            try:
                await ws.send_json(message)
            except Exception:
                pass

    def is_online(self, user_id: str) -> bool:
        return user_id in self.active and len(self.active[user_id]) > 0


manager = ConnectionManager()