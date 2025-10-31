from apps.agents.models import Agent
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import UserRateThrottle
from rest_framework.exceptions import PermissionDenied

from apps.core.permission import IsOwnerOrReadOnly

from .filters import AgentTaskFilter
from .models import AgentTask
from .serializers import AgentTaskSerializer


class TaskViewSet(viewsets.ModelViewSet):
    queryset = AgentTask.objects.select_related("agent","owner").all()
    serializer_class = AgentTaskSerializer
    # permission_classes = [IsAuthenticated]  # object-level checked further
    permission_classes = [IsOwnerOrReadOnly]

    filterset_class = AgentTaskFilter
    ordering_fields = ["created_at","status","agent__name"]
    throttle_classes = [UserRateThrottle]


    def get_object(self):
        obj = super().get_object()
        if obj.owner != self.request.user:
            raise PermissionDenied("Not owner")
        return obj

    def get_queryset(self):
        # enforce multi-tenant / owner isolation + query optimization
        qs = super().get_queryset().filter(owner=self.request.user)
        # prefetch recent related data if needed (e.g., agent's other fields)
        qs = qs.select_related("agent")
        return qs

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=False, methods=["post"], url_path="run", url_name="run")
    def run(self, request):
        """
        Create a task and trigger the async run (Celery). Returns created task.
        Payload: { "agent": agent_id, "input_text": "..." }
        """
        agent_id = request.data.get("agent")
        input_text = request.data.get("input_text")
        try:
            # Should directly find agent in serilizer
            agent = Agent.objects.get(pk=agent_id, owner=request.user)
        except Agent.DoesNotExist:
            return Response({"detail":"Agent not found"}, status=status.HTTP_404_NOT_FOUND)

        task = AgentTask.objects.create(agent=agent, owner=request.user, input_text=input_text, status="pending")
        # trigger Celery async job (Day 3 deep) — example:
        from tasks.tasks import run_agent_task_async  # celery task
        run_agent_task_async.delay(task.id)
        serializer = self.get_serializer(task)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
