from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model

from django.db import models


from rest_framework.generics import (
    CreateAPIView,
    ListAPIView,
    RetrieveAPIView,
    UpdateAPIView,
)
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import Task
from .serializers import TaskSerializer, TaskUpdateSerializer
from .permissions import IsTaskCreatorOrAssignee
from notifications.tasks import create_notification


User = get_user_model()



class TaskCreateView(CreateAPIView):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)






class TaskDetailView(RetrieveAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [
        IsAuthenticated,
        IsTaskCreatorOrAssignee,
    ]
    """
    Retrieve or update a task.
    """
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [
        IsAuthenticated,
        IsTaskCreatorOrAssignee,
    ]



class TaskUpdateView(UpdateAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskUpdateSerializer
    permission_classes = [IsAuthenticated, IsTaskCreatorOrAssignee]



class TaskAssignView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        task = get_object_or_404(Task, pk=pk)
        user = get_object_or_404(User, id=request.data["user_id"])

        # Assign task
        task.assign_to(user, request.user)

        # ✅ CREATE NOTIFICATION
        create_notification.delay(
    user.id,
    f"{request.user.email} assigned you the task '{task.title}'"
)

        return Response({"message": "Assigned"}, status=status.HTTP_200_OK)


class TaskStartView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        task = get_object_or_404(Task, pk=pk)
        task.start(by_user=request.user)

     # 🔔 Notify creator (if not same user)
        if task.created_by != request.user:
            create_notification.delay(
                task.created_by.id,
                f"{request.user.email} started the task '{task.title}'"
            )

        return Response(
            {"message": "Task started"},
            status=status.HTTP_200_OK
        )



class TaskCompleteView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        task = get_object_or_404(Task, pk=pk)
        task.complete(request.user)

         # 🔔 Notify creator (if not same user)
        if task.created_by != request.user:
            create_notification.delay(
                task.created_by.id,
                f"{request.user.email} completed the task '{task.title}'"
            )

        return Response({"message": "Completed"})
    
        



from rest_framework.generics import DestroyAPIView

class TaskDeleteView(DestroyAPIView):
    queryset = Task.objects.all()
    permission_classes = [IsAuthenticated, IsTaskCreatorOrAssignee]




from .pagination import TaskPagination

class TaskListView(ListAPIView):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = TaskPagination

    def get_queryset(self):
        user = self.request.user
        return Task.objects.filter(
            Q(created_by=user) | Q(assigned_to=user)
        ).distinct()
