from django.core.cache import cache
from apps.agents.models import Agent
from .models import AgentTask
from django.db.models import Count, Q
from django.utils import timezone
from datetime import timedelta


def get_cached_agents(user_id=None):
    """
    Cache agent list for 5 minutes.
    If user_id is provided, cache per-user.
    """
    if user_id:
        key = f"agents:list:user:{user_id}"
    else:
        key = "agents:list"

    agents = cache.get(key)
    if agents is None:
        queryset = Agent.objects.all()
        if user_id:
            queryset = queryset.filter(owner_id=user_id)
        agents = list(queryset.values("id", "name", "created_at", "owner_id"))
        cache.set(key, agents, timeout=300)  # Cache for 5 minutes
    return agents


def invalidate_agent_cache(user_id=None):
    """Invalidate agent cache for a specific user or globally."""
    if user_id:
        cache.delete(f"agents:list:user:{user_id}")
    cache.delete("agents:list")


def get_cached_task_stats(user_id):
    """
    Cache task statistics for a user (5 minutes).
    Returns counts by status.
    """
    key = f"tasks:stats:user:{user_id}"
    stats = cache.get(key)

    if stats is None:
        stats = AgentTask.objects.filter(owner_id=user_id).aggregate(
            total=Count("id"),
            pending=Count("id", filter=Q(status=AgentTask.STATUS_PENDING)),
            running=Count("id", filter=Q(status=AgentTask.STATUS_RUNNING)),
            completed=Count("id", filter=Q(status=AgentTask.STATUS_COMPLETED)),
            failed=Count("id", filter=Q(status=AgentTask.STATUS_FAILED)),
        )
        cache.set(key, stats, timeout=300)

    return stats


def invalidate_task_stats(user_id):
    """Invalidate task statistics cache for a user."""
    cache.delete(f"tasks:stats:user:{user_id}")


def get_cached_recent_tasks(agent_id, limit=10):
    """
    Cache recent tasks for an agent (2 minutes).
    Returns list of task dicts.
    """
    key = f"tasks:recent:agent:{agent_id}:{limit}"
    tasks = cache.get(key)

    if tasks is None:
        tasks = list(
            AgentTask.objects.filter(agent_id=agent_id)
            .order_by("-created_at")[:limit]
            .values("id", "input_text", "output_text", "status", "created_at")
        )
        cache.set(key, tasks, timeout=120)  # Cache for 2 minutes

    return tasks


def invalidate_agent_tasks_cache(agent_id):
    """Invalidate all task caches for an agent."""
    # Note: This is a simple implementation. For production, consider using
    # cache key patterns or Redis SCAN to delete all matching keys
    for limit in [10, 20, 50]:
        cache.delete(f"tasks:recent:agent:{agent_id}:{limit}")
