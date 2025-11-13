from django.db import models
from django.conf import settings
from apps.agents.models import Agent


class AgentTask(models.Model):
    STATUS_PENDING = "pending"
    STATUS_RUNNING = "running"
    STATUS_COMPLETED = "completed"
    STATUS_FAILED = "failed"

    STATUS_CHOICES = [
        (STATUS_PENDING, "pending"),
        (STATUS_RUNNING, "running"),
        (STATUS_COMPLETED, "completed"),
        (STATUS_FAILED, "failed"),
    ]
    agent = models.ForeignKey(Agent, on_delete=models.CASCADE, related_name="tasks")
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="tasks"
    )
    input_text = models.TextField()
    output_text = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    started_at = models.DateTimeField(null=True, blank=True)
    finished_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]
