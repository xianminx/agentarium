"""Comprehensive API endpoint tests."""
import pytest
from apps.agents.models import Agent
from apps.tasks.models import AgentTask
from django.contrib.auth import get_user_model

User = get_user_model()


@pytest.mark.django_db
class TestAgentAPIEndpoints:
    """Test all Agent API endpoints comprehensively."""

    def test_agent_list_pagination(self, api_client, user):
        """Test agent list pagination."""
        # Create 25 agents
        for i in range(25):
            Agent.objects.create(owner=user, name=f"Agent{i}")

        response = api_client.get("/api/agents/")
        assert response.status_code == 200
        data = response.json()

        # Should have pagination
        assert "results" in data or isinstance(data, list)
        if "results" in data:
            assert len(data["results"]) <= 20  # Default page size
            assert "count" in data
            assert data["count"] == 25

    def test_agent_detail_get(self, api_client, user):
        """Test retrieving a single agent."""
        agent = Agent.objects.create(owner=user, name="DetailAgent")
        response = api_client.get(f"/api/agents/{agent.id}/")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == agent.id
        assert data["name"] == "DetailAgent"

    def test_agent_update_patch(self, api_client, user):
        """Test updating an agent with PATCH."""
        agent = Agent.objects.create(owner=user, name="OldName")
        response = api_client.patch(f"/api/agents/{agent.id}/", {"name": "NewName"})
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "NewName"

        agent.refresh_from_db()
        assert agent.name == "NewName"

    def test_agent_update_put(self, api_client, user):
        """Test updating an agent with PUT."""
        agent = Agent.objects.create(
            owner=user, name="OldName", description="Old description"
        )
        response = api_client.put(
            f"/api/agents/{agent.id}/",
            {
                "name": "UpdatedName",
                "description": "Updated description",
                "model": "gpt-4",
                "temperature": 0.5,
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "UpdatedName"
        assert data["description"] == "Updated description"

    def test_agent_delete(self, api_client, user):
        """Test deleting an agent."""
        agent = Agent.objects.create(owner=user, name="DeleteMe")
        response = api_client.delete(f"/api/agents/{agent.id}/")
        assert response.status_code == 204

        # Verify deletion
        assert not Agent.objects.filter(id=agent.id).exists()

    def test_agent_create_validation_error(self, api_client, user):
        """Test creating an agent with invalid data."""
        response = api_client.post("/api/agents/", {})
        assert response.status_code == 400
        data = response.json()
        assert "name" in data

    def test_agent_unauthorized_access(self, api_client, user):
        """Test that users cannot access other users' agents."""
        other_user = User.objects.create_user(
            username="other", email="other@test.com", password="pass"
        )
        agent = Agent.objects.create(owner=other_user, name="PrivateAgent")

        # Try to update other user's agent
        response = api_client.patch(f"/api/agents/{agent.id}/", {"name": "Hacked"})
        # Should either be 403 or 404 depending on permission implementation
        assert response.status_code in [403, 404]

    def test_agent_list_filtering_by_owner(self, api_client, user):
        """Test that agent list only shows owner's agents."""
        other_user = User.objects.create_user(
            username="other", email="other@test.com", password="pass"
        )

        Agent.objects.create(owner=user, name="MyAgent1")
        Agent.objects.create(owner=user, name="MyAgent2")
        Agent.objects.create(owner=other_user, name="OtherAgent")

        response = api_client.get("/api/agents/")
        assert response.status_code == 200
        data = response.json()

        results = data.get("results", data)
        names = [a["name"] for a in results]

        assert "MyAgent1" in names
        assert "MyAgent2" in names
        assert "OtherAgent" not in names


@pytest.mark.django_db
class TestTaskAPIEndpoints:
    """Test all Task API endpoints comprehensively."""

    def test_task_list_empty(self, api_client, user):
        """Test task list when no tasks exist."""
        response = api_client.get("/api/tasks/")
        assert response.status_code == 200
        data = response.json()
        results = data.get("results", data)
        assert len(results) == 0

    def test_task_create(self, api_client, user):
        """Test creating a task."""
        agent = Agent.objects.create(owner=user, name="TaskAgent")
        response = api_client.post(
            "/api/tasks/", {"agent": agent.id, "input_text": "Test input"}
        )
        assert response.status_code == 201
        data = response.json()
        assert data["agent"] == agent.id
        assert data["input_text"] == "Test input"
        assert data["status"] == "pending"

    def test_task_filter_by_status(self, api_client, user):
        """Test filtering tasks by status."""
        agent = Agent.objects.create(owner=user, name="FilterAgent")
        AgentTask.objects.create(
            agent=agent, owner=user, input_text="T1", status="completed"
        )
        AgentTask.objects.create(
            agent=agent, owner=user, input_text="T2", status="pending"
        )
        AgentTask.objects.create(
            agent=agent, owner=user, input_text="T3", status="pending"
        )

        # Filter by completed
        response = api_client.get("/api/tasks/?status=completed")
        assert response.status_code == 200
        data = response.json()
        results = data.get("results", data)
        assert len(results) == 1
        assert results[0]["status"] == "completed"

        # Filter by pending
        response = api_client.get("/api/tasks/?status=pending")
        assert response.status_code == 200
        data = response.json()
        results = data.get("results", data)
        assert len(results) == 2

    def test_task_filter_by_agent(self, api_client, user):
        """Test filtering tasks by agent."""
        agent1 = Agent.objects.create(owner=user, name="Agent1")
        agent2 = Agent.objects.create(owner=user, name="Agent2")

        AgentTask.objects.create(agent=agent1, owner=user, input_text="A1T1")
        AgentTask.objects.create(agent=agent1, owner=user, input_text="A1T2")
        AgentTask.objects.create(agent=agent2, owner=user, input_text="A2T1")

        response = api_client.get(f"/api/tasks/?agent={agent1.id}")
        assert response.status_code == 200
        data = response.json()
        results = data.get("results", data)
        assert len(results) == 2

    def test_task_ordering(self, api_client, user):
        """Test ordering tasks."""
        agent = Agent.objects.create(owner=user, name="OrderAgent")
        task1 = AgentTask.objects.create(agent=agent, owner=user, input_text="First")
        import time

        time.sleep(0.01)  # Ensure different timestamps
        task2 = AgentTask.objects.create(agent=agent, owner=user, input_text="Second")

        # Order by created_at descending (newest first)
        response = api_client.get("/api/tasks/?ordering=-created_at")
        assert response.status_code == 200
        data = response.json()
        results = data.get("results", data)
        if len(results) >= 2:
            assert results[0]["id"] == task2.id
            assert results[1]["id"] == task1.id

    def test_task_detail_get(self, api_client, user):
        """Test retrieving a single task."""
        agent = Agent.objects.create(owner=user, name="DetailAgent")
        task = AgentTask.objects.create(
            agent=agent, owner=user, input_text="Detail test"
        )

        response = api_client.get(f"/api/tasks/{task.id}/")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == task.id
        assert data["input_text"] == "Detail test"

    def test_task_unauthorized_access(self, api_client, user):
        """Test that users cannot access other users' tasks."""
        other_user = User.objects.create_user(
            username="other", email="other@test.com", password="pass"
        )
        agent = Agent.objects.create(owner=other_user, name="OtherAgent")
        task = AgentTask.objects.create(
            agent=agent, owner=other_user, input_text="Private task"
        )

        response = api_client.get(f"/api/tasks/{task.id}/")
        # Should be 403 or 404
        assert response.status_code in [403, 404]

    def test_task_validation_missing_fields(self, api_client, user):
        """Test task creation with missing fields."""
        response = api_client.post("/api/tasks/", {})
        assert response.status_code == 400

    def test_task_validation_invalid_agent(self, api_client, user):
        """Test task creation with non-existent agent."""
        response = api_client.post(
            "/api/tasks/", {"agent": 99999, "input_text": "Test"}  # Non-existent agent
        )
        assert response.status_code == 400


@pytest.mark.django_db
class TestTaskRunEndpoint:
    """Test the /api/tasks/run/ endpoint."""

    def test_run_endpoint_creates_task(self, api_client, user, monkeypatch):
        """Test that run endpoint creates a task and triggers execution."""
        agent = Agent.objects.create(owner=user, name="RunAgent")

        # Mock Celery delay
        called = {}

        def fake_delay(task_id):
            called["task_id"] = task_id

        monkeypatch.setattr("apps.tasks.tasks.run_agent_task_async.delay", fake_delay)

        response = api_client.post(
            "/api/tasks/run/", {"agent": agent.id, "input_text": "Run this task"}
        )

        assert response.status_code == 201
        data = response.json()
        assert data["agent"] == agent.id
        assert data["input_text"] == "Run this task"
        assert "task_id" in called

    def test_run_endpoint_validation(self, api_client, user):
        """Test run endpoint validation."""
        response = api_client.post("/api/tasks/run/", {})
        assert response.status_code == 400
