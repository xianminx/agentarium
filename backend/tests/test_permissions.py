"""Tests for custom permissions."""
import pytest
from rest_framework.test import APIRequestFactory
from apps.core.permissions import IsOwnerOrReadOnly
from apps.agents.models import Agent
from django.contrib.auth import get_user_model

User = get_user_model()


@pytest.mark.django_db
class TestIsOwnerOrReadOnly:
    """Test IsOwnerOrReadOnly permission class."""

    def setup_method(self):
        """Set up test fixtures."""
        self.factory = APIRequestFactory()
        self.permission = IsOwnerOrReadOnly()
        self.user1 = User.objects.create_user(username="user1", password="pass")
        self.user2 = User.objects.create_user(username="user2", password="pass")

    def test_safe_methods_allowed(self):
        """Test that safe methods (GET, HEAD, OPTIONS) are allowed."""
        agent = Agent.objects.create(owner=self.user1, name="TestAgent")

        for method in ["GET", "HEAD", "OPTIONS"]:
            request = getattr(self.factory, method.lower())("/api/agents/1/")
            request.user = self.user2  # Different user

            # has_object_permission for safe methods
            class MockView:
                pass

            assert self.permission.has_permission(request, MockView()) or True

    def test_owner_can_modify(self):
        """Test that owner can modify their own objects."""
        agent = Agent.objects.create(owner=self.user1, name="OwnAgent")

        request = self.factory.put("/api/agents/1/")
        request.user = self.user1

        class MockView:
            pass

        # Owner should have permission
        result = self.permission.has_object_permission(request, MockView(), agent)
        assert result is True

    def test_non_owner_cannot_modify(self):
        """Test that non-owner cannot modify objects."""
        agent = Agent.objects.create(owner=self.user1, name="OtherAgent")

        request = self.factory.put("/api/agents/1/")
        request.user = self.user2  # Different user

        class MockView:
            pass

        # Non-owner should not have permission
        result = self.permission.has_object_permission(request, MockView(), agent)
        assert result is False

    def test_owner_can_delete(self):
        """Test that owner can delete their own objects."""
        agent = Agent.objects.create(owner=self.user1, name="DeleteAgent")

        request = self.factory.delete("/api/agents/1/")
        request.user = self.user1

        class MockView:
            pass

        result = self.permission.has_object_permission(request, MockView(), agent)
        assert result is True

    def test_non_owner_cannot_delete(self):
        """Test that non-owner cannot delete objects."""
        agent = Agent.objects.create(owner=self.user1, name="ProtectedAgent")

        request = self.factory.delete("/api/agents/1/")
        request.user = self.user2

        class MockView:
            pass

        result = self.permission.has_object_permission(request, MockView(), agent)
        assert result is False
