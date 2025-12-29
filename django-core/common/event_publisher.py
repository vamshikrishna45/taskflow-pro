import json
import redis
from django.conf import settings
from datetime import datetime


class RedisEventPublisher:
    """
    Publishes domain events to Redis.
    Django does not care who consumes them.
    """

    def __init__(self):
        self.client = redis.Redis(
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            decode_responses=True,
        )

    def publish(self, event_type: str, payload: dict):
        event = {
            "event_type": event_type,
            "payload": payload,
            "timestamp": datetime.utcnow().isoformat(),
        }

        self.client.publish("task_events", json.dumps(event))
