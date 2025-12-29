from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings


@shared_task(bind=True, max_retries=3)
def send_reset_email(self, email, reset_link):
    """
    Sends password reset email asynchronously
    """

    subject = "Reset your TaskFlowPro password"

    message = (
        "You requested a password reset for your TaskFlowPro account.\n\n"
        f"Click the link below to reset your password:\n{reset_link}\n\n"
        "If you did not request this, please ignore this email."
    )

    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
        )

    except Exception as exc:
        # Retry up to 3 times with delay
        raise self.retry(exc=exc, countdown=10)
