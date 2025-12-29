from django.conf import settings
from django.db import models
from common.event_publisher import RedisEventPublisher
from common.events import EventType
from django.core.exceptions import PermissionDenied



# Create your models here.
class TaskStatus(models.TextChoices):
    """
    Controls the lifecycle of a task.
    Keeps status values consistent across the system.
    """
    TODO = "TODO", "To Do"
    IN_PROGRESS = "IN_PROGRESS", "In Progress"
    DONE = "DONE", "Done"


class Task(models.Model):
    """
    Core task entity.
    Owned and modified only by Django.
    """

    title = models.CharField(
        max_length=255,
        help_text="Short summary of the task"
    )

    description = models.TextField(
        blank=True,
        help_text="Optional detailed description"
    )

    status = models.CharField(
        max_length=20,
        choices=TaskStatus.choices,
        default=TaskStatus.TODO
    )

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="created_tasks"
    )

    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_tasks"
    )

    deadline = models.DateTimeField(
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return f"{self.title} ({self.status})"
    
    def assign_to(self, user, by_user):
        if self.created_by != by_user:
            raise PermissionDenied("Only creator can assign")

        self.assigned_to = user
        self.save(update_fields=["assigned_to", "updated_at"])

        RedisEventPublisher().publish(
        EventType.TASK_ASSIGNED,
        {
            "task_id": self.id,
            "assigned_to": user.id,
            "assigned_by": by_user.id,
        }
    )


    def mark_in_progress(self):
        self.status = TaskStatus.IN_PROGRESS
        self.save(update_fields=["status", "updated_at"])

    def mark_done(self):
        self.status = TaskStatus.DONE
        self.save(update_fields=["status", "updated_at"])

    
    def start(self, by_user):
        if self.assigned_to != by_user:
            raise PermissionDenied("Only assignee can start")
        if self.status != TaskStatus.TODO:
            raise ValueError("Invalid state transition")

        self.status = TaskStatus.IN_PROGRESS
        self.save(update_fields=["status", "updated_at"])

        RedisEventPublisher().publish(
        EventType.TASK_STARTED,
        {
            "task_id": self.id,
            "started_by": by_user.id,
        }
    )
        


    def complete(self, by_user):
        if self.assigned_to != by_user:
            raise PermissionDenied("Only assignee can complete")
        if self.status != TaskStatus.IN_PROGRESS:
            raise ValueError("Invalid state transition")

        self.status = TaskStatus.DONE
        self.save(update_fields=["status", "updated_at"])

        RedisEventPublisher().publish(
        EventType.TASK_COMPLETED,
        {
            "task_id": self.id,
            "completed_by": by_user.id,
        }
    )


