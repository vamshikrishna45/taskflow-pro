from rest_framework import serializers
from .models import Task


class TaskSerializer(serializers.ModelSerializer):
    """
    Serializer for Task.
    Handles validation and representation only.
    """

    created_by = serializers.EmailField(source="created_by.email", read_only=True)
    assigned_to = serializers.EmailField(source="assigned_to.email", read_only=True)
    can_delete = serializers.SerializerMethodField()


    def get_can_delete(self, task):
        user = self.context["request"].user
        if user.is_superuser:
            return True
        return task.created_by == user and task.status == "TODO"



    class Meta:
        model = Task
        fields = "__all__"
        read_only_fields = ("created_at", "updated_at")



class TaskUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ["title", "description", "deadline"]
