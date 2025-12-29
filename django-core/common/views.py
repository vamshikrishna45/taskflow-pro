from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from tasks.models import Task

from notifications.models import Notification

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dashboard_view(request):
    user = request.user

    tasks_created = Task.objects.filter(created_by=user).count()
    tasks_assigned = Task.objects.filter(assigned_to=user).count()
    tasks_pending = Task.objects.filter(
        assigned_to=user
    ).exclude(status="completed").count()

    unread_notifications = Notification.objects.filter(
        user=user,
        is_read=False
    ).count()

    return Response({
        "message": f"Hi {user.first_name or user.email}, welcome to TaskFlowPro Dashboard",
        "summary": {
            "tasks_created": tasks_created,
            "tasks_assigned": tasks_assigned,
            "tasks_pending": tasks_pending,
            "unread_notifications": unread_notifications
        }
    })
