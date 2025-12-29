from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from dotenv import load_dotenv
import os
import jwt

from websocket_manager import WebSocketManager
from redis_listener import RedisEventListener

from dotenv import load_dotenv
from pathlib import Path
import os

# fastapi-realtime/main.py
# Move up ONE level → TASKFLOWPRO
# Then go into django-core/.env

BASE_DIR = Path(__file__).resolve().parent.parent
ENV_PATH = BASE_DIR / "django-core" / ".env"

load_dotenv(dotenv_path=ENV_PATH)

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"

print("Loaded SECRET_KEY:", bool(SECRET_KEY))

if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY not loaded")


app = FastAPI()
ws_manager = WebSocketManager()


@app.on_event("startup")
def start_redis_listener():
    listener = RedisEventListener(ws_manager)
    listener.start()


@app.websocket("/ws/notifications")
async def websocket_endpoint(websocket: WebSocket):
    token = websocket.query_params.get("token")

    if not token:
        await websocket.close(code=1008)
        return

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(payload["user_id"])
    except Exception as e:
        await websocket.close(code=1008)
        return

    await ws_manager.connect(user_id, websocket)

    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(user_id, websocket)
