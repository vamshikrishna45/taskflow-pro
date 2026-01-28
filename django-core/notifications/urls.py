from django.urls import path
from .views import NotificationListAPIView, MarkNotificationReadAPIView, unread_count

urlpatterns = [
    path("v1/notifications/", NotificationListAPIView.as_view()),
    path("v1/notifications/<int:pk>/read/", MarkNotificationReadAPIView.as_view()),
    path("v1/notifications/unread-count/", unread_count),
]



