from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import Notification
from .serializers import NotificationSerializer
from rest_framework.generics import (
    CreateAPIView,
    ListAPIView,
    RetrieveAPIView,
    UpdateAPIView,
)
from .pagination import NotificationPagination

# notifications/views.py
class NotificationListAPIView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSerializer
    pagination_class = NotificationPagination

    def get_queryset(self):
        return Notification.objects.filter(
            user=self.request.user
        ).order_by("-created_at")

class MarkNotificationReadAPIView(APIView):
    """
    Marks a single notification as read.
    """
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        notification = Notification.objects.filter(
            pk=pk,
            user=request.user
        ).first()

        if not notification:
            return Response(
                {"error": "Notification not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        notification.is_read = True
        notification.save(update_fields=["is_read"])

        return Response(
            {"message": "Notification marked as read"},
            status=status.HTTP_200_OK
        )



from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response


# notifications/views.py
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def unread_count(request):
    count = Notification.objects.filter(
        user=request.user,
        is_read=False
    ).count()
    return Response({"unread": count})
