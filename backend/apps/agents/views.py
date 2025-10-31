from django.db.models import Count, Prefetch
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from apps.core.permissions import IsOwnerOrReadOnly
from apps.tasks.models import AgentTask

from .models import Agent
from .serializers import AgentSerializer


class AgentViewSet(viewsets.ModelViewSet):
    serializer_class = AgentSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]

    def get_queryset(self):
        return (
            Agent.objects.filter(owner=self.request.user)
            .annotate(tasks_count=Count("tasks"))
            .prefetch_related(
                Prefetch(
                    "tasks",
                    queryset=AgentTask.objects.order_by("-created_at"),
                    to_attr="recent_tasks",
                )
            )
        )
 
    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
