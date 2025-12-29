from django.urls import path
from .views import NotificationListAPIView, MarkNotificationReadAPIView, unread_count

urlpatterns = [
    path("", NotificationListAPIView.as_view()),
    path("<int:pk>/read/", MarkNotificationReadAPIView.as_view()),
    # urls.py
path("unread-count/", unread_count),

]
