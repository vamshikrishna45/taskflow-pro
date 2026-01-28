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


from .ai_models.priority_suggest import suggest_priority


from .ai_models.enhance_description import enhance_description


class TaskDescriptionEnhanceView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        description = request.data.get("description", "").strip()

        if not description:
            return Response(
                {"error": "Description is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        enhanced = enhance_description(description)

        return Response({
            "enhanced_description": enhanced
        })

class TaskCreateView(CreateAPIView):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(
            created_by=self.request.user
        )



class TaskPrioritySuggestView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        title = request.data.get("title", "")
        description = request.data.get("description", "")

        if not title:
            return Response(
                {"error": "Title required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        priority = suggest_priority(title, description)

        return Response({
            "suggested_priority": priority
        })





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
        
        # Only creator can assign
        if task.created_by != request.user:
            return Response(
                {"error": "Only the task creator can assign this task"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Only TODO tasks can be assigned
        if task.status != "TODO":
            return Response(
                {"error": "Only TODO tasks can be assigned"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Task must not be already assigned
        if task.assigned_to:
            return Response(
                {"error": "Task is already assigned"},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = get_object_or_404(User, id=request.data.get("user_id"))

        task.assign_to(user, request.user)

        create_notification.delay(
            user.id,
            f"{request.user.email} assigned you the task '{task.title}'"
        )

        return Response({"message": "Task assigned successfully"}, status=status.HTTP_200_OK)


class TaskStartView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        task = get_object_or_404(Task, pk=pk)
        
        # Only assignee can start
        if task.assigned_to != request.user:
            return Response(
                {"error": "Only the assigned user can start this task"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Only TODO tasks can be started
        if task.status != "TODO":
            return Response(
                {"error": "Task is not in TODO status"},
                status=status.HTTP_400_BAD_REQUEST
            )

        task.start(by_user=request.user)

        if task.created_by != request.user:
            create_notification.delay(
                task.created_by.id,
                f"{request.user.email} started the task '{task.title}'"
            )

        return Response({"message": "Task started successfully"})


class TaskCompleteView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        task = get_object_or_404(Task, pk=pk)
        
        # Only assignee can complete
        if task.assigned_to != request.user:
            return Response(
                {"error": "Only the assigned user can complete this task"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Only IN_PROGRESS tasks can be completed
        if task.status != "IN_PROGRESS":
            return Response(
                {"error": "Task must be in IN_PROGRESS status to complete"},
                status=status.HTTP_400_BAD_REQUEST
            )

        task.complete(request.user)

        if task.created_by != request.user:
            create_notification.delay(
                task.created_by.id,
                f"{request.user.email} completed the task '{task.title}'"
            )

        return Response({"message": "Task completed successfully"})


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
        queryset = Task.objects.filter(
            Q(created_by=user) | Q(assigned_to=user)
        ).distinct().order_by('-id')  # ← ADD THIS
    
        priority = self.request.query_params.get('priority')
        if priority:
            queryset = queryset.filter(priority=priority)
    
        return queryset