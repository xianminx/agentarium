"""Tests for caching functionality."""
import pytest
from django.core.cache import cache
from apps.agents.models import Agent
from apps.tasks.cache import get_cached_agents
from django.contrib.auth import get_user_model

User = get_user_model()


@pytest.mark.django_db
class TestCaching:
    """Test cache utilities."""

    def setup_method(self):
        """Clear cache before each test."""
        cache.clear()

    def teardown_method(self):
        """Clear cache after each test."""
        cache.clear()

    def test_get_cached_agents_first_call(self, user):
        """Test that first call retrieves from database."""
        Agent.objects.create(owner=user, name="Agent1")
        Agent.objects.create(owner=user, name="Agent2")

        agents = get_cached_agents()
        assert len(agents) == 2
        # get_cached_agents returns dicts, not model instances
        assert any(a["name"] == "Agent1" for a in agents)
        assert any(a["name"] == "Agent2" for a in agents)

    def test_get_cached_agents_returns_from_cache(self, user):
        """Test that subsequent calls return from cache."""
        Agent.objects.create(owner=user, name="CachedAgent")

        # First call - cache miss
        agents1 = get_cached_agents()

        # Create another agent
        Agent.objects.create(owner=user, name="NewAgent")

        # Second call - cache hit (should not include new agent)
        agents2 = get_cached_agents()

        # Both should have same length if caching works
        assert len(agents1) == len(agents2) == 1

    def test_cache_invalidation(self, user):
        """Test manual cache invalidation."""
        Agent.objects.create(owner=user, name="Agent1")

        # First call
        agents1 = get_cached_agents()
        assert len(agents1) == 1

        # Clear cache (use correct cache key)
        cache.delete("agents:list")

        # Create new agent
        Agent.objects.create(owner=user, name="Agent2")

        # Second call after cache clear
        agents2 = get_cached_agents()
        assert len(agents2) == 2

    def test_cache_expiration(self, user):
        """Test that cache respects TTL (time to live)."""
        Agent.objects.create(owner=user, name="ExpiringAgent")

        # Get agents with short TTL
        cache_key = "test_agents_list"
        agents = list(Agent.objects.all())
        cache.set(cache_key, agents, timeout=1)  # 1 second TTL

        # Immediately retrieve - should be in cache
        cached = cache.get(cache_key)
        assert cached is not None
        assert len(cached) == 1

        # After expiration, cache should be empty
        import time

        time.sleep(2)
        expired = cache.get(cache_key)
        assert expired is None

    def test_cache_set_get_basic(self):
        """Test basic cache set and get operations."""
        cache.set("test_key", "test_value", timeout=60)
        value = cache.get("test_key")
        assert value == "test_value"

    def test_cache_get_default(self):
        """Test cache get with default value."""
        value = cache.get("nonexistent_key", default="default_value")
        assert value == "default_value"

    def test_cache_delete(self):
        """Test cache deletion."""
        cache.set("delete_me", "value")
        assert cache.get("delete_me") == "value"

        cache.delete("delete_me")
        assert cache.get("delete_me") is None
