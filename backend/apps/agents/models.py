from django.db import models
from django.conf import settings


class Agent(models.Model):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="agents"
    )
    name = models.CharField(max_length=120)
    description = models.TextField(blank=True)
    model = models.CharField(max_length=50, default="gpt-4o-mini")
    temperature = models.FloatField(default=0.7)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
