from celery import shared_task
from .models import Notification
from django.contrib.auth import get_user_model

User = get_user_model()

@shared_task(bind=True, autoretry_for=(Exception,), retry_backoff=5, retry_kwargs={"max_retries": 3})
def create_notification(self, user_id, message):
    user = User.objects.get(id=user_id)
    Notification.objects.create(
        user=user,
        message=message
    )
