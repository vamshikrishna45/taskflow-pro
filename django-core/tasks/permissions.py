from rest_framework.permissions import BasePermission


class IsTaskCreatorOrAssignee(BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.created_by == request.user or obj.assigned_to == request.user



class CanDeleteTask(BasePermission):
    def has_object_permission(self, request, view, task):
        if request.user.is_superuser:
            return True
        return task.created_by == request.user and task.status == "TODO"
