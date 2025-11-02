from django.core.cache import cache
from .models import Agent

def get_cached_agents():
    """Cache agent list for 1 minute."""
    key = "agents:list"
    agents = cache.get(key)
    if agents is None:
        agents = list(Agent.objects.values("id", "name", "created_at"))
        cache.set(key, agents, timeout=60)
    return agents
