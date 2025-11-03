from rest_framework import serializers
from .models import Agent
from apps.tasks.serializers import AgentTaskSerializer


class AgentSerializer(serializers.ModelSerializer):
    tasks_count = serializers.IntegerField(read_only=True)
    recent_tasks = AgentTaskSerializer(many=True, read_only=True)

    class Meta:
        model = Agent
        fields = [
            "id",
            "name",
            "description",
            "model",
            "temperature",
            "created_at",
            "tasks_count",
            "recent_tasks",
        ]
