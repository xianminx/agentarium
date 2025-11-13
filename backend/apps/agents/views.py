from django.db.models import Count, Prefetch
from rest_framework import viewsets

from apps.core.permissions import IsOwnerOrReadOnly
from apps.tasks.models import AgentTask
from rest_framework.permissions import AllowAny, IsAuthenticatedOrReadOnly

from .models import Agent
from .serializers import AgentSerializer
from rest_framework.exceptions import PermissionDenied
from rest_framework.views import APIView
from rest_framework.response import Response
from apps.tasks.cache import get_cached_agents


class AgentViewSet(viewsets.ModelViewSet):
    serializer_class = AgentSerializer
    # permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        qs = Agent.objects

        # if user.is_authenticated:
        #     qs = qs.filter(owner=user)

        return qs.annotate(tasks_count=Count("tasks")).prefetch_related(
            Prefetch(
                "tasks",
                queryset=AgentTask.objects.order_by("-created_at"),
                to_attr="recent_tasks",
            )
        )

    def perform_create(self, serializer):
        if not self.request.user.is_authenticated:
            raise PermissionDenied("You must be logged in to create an agent.")
        serializer.save(owner=self.request.user)


class AgentListCachedView(APIView):
    def get(self, request):
        agents = get_cached_agents()
        return Response(agents)
