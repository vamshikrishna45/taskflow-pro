import json
import redis
import threading


class RedisEventListener:
    """
    Blocking Redis Pub/Sub listener.
    Runs in a separate thread.
    """

    def __init__(self, ws_manager):
        self.ws_manager = ws_manager
        self.redis = redis.Redis(
            host="localhost",
            port=6379,
            decode_responses=True,
        )

    def start(self):
        thread = threading.Thread(target=self._listen, daemon=True)
        thread.start()

    def _listen(self):
        pubsub = self.redis.pubsub()
        pubsub.subscribe("task_events")

        for message in pubsub.listen():
            if message["type"] != "message":
                continue

            event = json.loads(message["data"])
            self.handle_event(event)

    def handle_event(self, event: dict):
        event_type = event["event_type"]
        payload = event["payload"]

        if event_type == "task.assigned":
            self.ws_manager.send_to_user_sync(
                payload["assigned_to"], event
            )

        elif event_type == "task.started":
            self.ws_manager.send_to_user_sync(
                payload["started_by"], event
            )

        elif event_type == "task.completed":
            self.ws_manager.send_to_user_sync(
                payload["completed_by"], event
            )
