from rest_framework import serializers
from .models import AgentTask


class AgentTaskSerializer(serializers.ModelSerializer):
    agent_name = serializers.CharField(source="agent.name", read_only=True)

    class Meta:
        model = AgentTask
        fields = [
            "id",
            "agent",
            "agent_name",
            "input_text",
            "output_text",
            "status",
            "created_at",
            "started_at",
            "finished_at",
        ]
        read_only_fields = ["output_text", "status", "started_at", "finished_at"]
