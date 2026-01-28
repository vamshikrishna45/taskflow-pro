from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from tasks.models import Task
from notifications.models import Notification


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dashboard_summary_api(request):
    """
    Returns dashboard summary data for the authenticated user.
    This API is consumed by the Next.js frontend.
    """
    user = request.user

    tasks_created_count = Task.objects.filter(
        created_by=user
    ).count()

    tasks_assigned_count = Task.objects.filter(
        assigned_to=user
    ).count()

    tasks_pending_count = Task.objects.filter(
        assigned_to=user
    ).exclude(status="completed").count()

    unread_notifications_count = Notification.objects.filter(
        user=user,
        is_read=False
    ).count()

    return Response({
        "message": f"Hi {user.first_name or user.email}, welcome to TaskFlowPro Dashboard",
        "summary": {
            "tasks_created": tasks_created_count,
            "tasks_assigned": tasks_assigned_count,
            "tasks_pending": tasks_pending_count,
            "unread_notifications": unread_notifications_count,
        }
    })
