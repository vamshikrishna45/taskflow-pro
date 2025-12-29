import asyncio
from typing import Dict, List
from fastapi import WebSocket


class WebSocketManager:
    def __init__(self):
        self.active_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, user_id: int, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.setdefault(user_id, []).append(websocket)

    def disconnect(self, user_id: int, websocket: WebSocket):
        self.active_connections[user_id].remove(websocket)
        if not self.active_connections[user_id]:
            del self.active_connections[user_id]

    async def send_to_user(self, user_id: int, message: dict):
        if user_id not in self.active_connections:
            return

        for ws in self.active_connections[user_id]:
            await ws.send_json(message)

    def send_to_user_sync(self, user_id: int, message: dict):
        """
        Called from Redis thread.
        Bridges to async event loop safely.
        """
        loop = asyncio.get_event_loop()
        asyncio.run_coroutine_threadsafe(
            self.send_to_user(user_id, message), loop
        )
