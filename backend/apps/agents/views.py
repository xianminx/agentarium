from rest_framework import viewsets

from apps.core.permissions import IsOwnerOrReadOnly
from .models import Agent
from .serializers import AgentSerializer
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Prefetch


class AgentViewSet(viewsets.ModelViewSet):
    serializer_class = AgentSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]

    def get_queryset(self):
        qs = Agent.objects.filter(owner=self.request.user).annotate(
            tasks_count=Count("tasks"),
        ).prefetch_related(
            Prefetch(
                "tasks",
                queryset=Agent.tasks.related.model.objects.order_by("-created_at")[:5],
                to_attr="recent_tasks",
            )
        )
        return qs
    
    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
