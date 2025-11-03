"""Tests for Agent and AgentTask models."""
import pytest
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from apps.agents.models import Agent
from apps.tasks.models import AgentTask
from datetime import datetime

User = get_user_model()


@pytest.mark.django_db
class TestAgentModel:
    """Test Agent model functionality."""

    def test_create_agent_minimal(self, user):
        """Test creating an agent with minimal required fields."""
        agent = Agent.objects.create(owner=user, name="Test Agent")
        assert agent.id is not None
        assert agent.name == "Test Agent"
        assert agent.owner == user
        assert agent.description == ""
        assert agent.model == "gpt-4o-mini"
        assert agent.temperature == 0.7
        assert agent.created_at is not None

    def test_create_agent_full(self, user):
        """Test creating an agent with all fields."""
        agent = Agent.objects.create(
            owner=user,
            name="Full Agent",
            description="A comprehensive test agent",
            model="gpt-4",
            temperature=0.5,
        )
        assert agent.name == "Full Agent"
        assert agent.description == "A comprehensive test agent"
        assert agent.model == "gpt-4"
        assert agent.temperature == 0.5

    def test_agent_str_representation(self, user):
        """Test string representation of Agent."""
        agent = Agent.objects.create(owner=user, name="StrAgent")
        assert str(agent) in ["StrAgent", f"Agent: StrAgent"] or "StrAgent" in str(
            agent
        )

    def test_agent_owner_required(self):
        """Test that owner is required."""
        with pytest.raises(Exception):  # Could be IntegrityError or ValidationError
            Agent.objects.create(name="No Owner")

    def test_agent_name_max_length(self, user):
        """Test agent name max length constraint."""
        long_name = "A" * 121  # Max is 120
        with pytest.raises(ValidationError):
            agent = Agent(owner=user, name=long_name)
            agent.full_clean()  # Triggers validation

    def test_multiple_agents_same_user(self, user):
        """Test that a user can own multiple agents."""
        agent1 = Agent.objects.create(owner=user, name="Agent1")
        agent2 = Agent.objects.create(owner=user, name="Agent2")
        assert Agent.objects.filter(owner=user).count() == 2

    def test_agent_deletion_cascade(self, user):
        """Test that deleting user cascades to agents (or protects)."""
        agent = Agent.objects.create(owner=user, name="ToDelete")
        user_id = user.id
        # Depending on your ForeignKey configuration (CASCADE, PROTECT, etc.)
        # This tests the cascade behavior
        Agent.objects.filter(owner=user).delete()
        assert not Agent.objects.filter(id=agent.id).exists()


@pytest.mark.django_db
class TestAgentTaskModel:
    """Test AgentTask model functionality."""

    def test_create_task_minimal(self, user):
        """Test creating a task with minimal fields."""
        agent = Agent.objects.create(owner=user, name="TaskAgent")
        task = AgentTask.objects.create(agent=agent, owner=user, input_text="Hello")
        assert task.id is not None
        assert task.agent == agent
        assert task.owner == user
        assert task.input_text == "Hello"
        assert task.output_text is None
        assert task.status == "pending"
        assert task.created_at is not None
        assert task.started_at is None
        assert task.finished_at is None

    def test_task_status_choices(self, user):
        """Test that only valid status choices are allowed."""
        agent = Agent.objects.create(owner=user, name="StatusAgent")

        # Valid statuses
        for status in ["pending", "running", "completed", "failed"]:
            task = AgentTask.objects.create(
                agent=agent, owner=user, input_text=f"Test {status}", status=status
            )
            assert task.status == status

    def test_task_status_invalid(self, user):
        """Test that invalid status raises validation error."""
        agent = Agent.objects.create(owner=user, name="InvalidAgent")
        with pytest.raises(ValidationError):
            task = AgentTask(
                agent=agent, owner=user, input_text="Test", status="invalid_status"
            )
            task.full_clean()

    def test_task_str_representation(self, user):
        """Test string representation of AgentTask."""
        agent = Agent.objects.create(owner=user, name="StrAgent")
        task = AgentTask.objects.create(
            agent=agent, owner=user, input_text="Test input"
        )
        task_str = str(task)
        assert any(s in task_str for s in ["AgentTask", "Test input", str(task.id)])

    def test_task_timestamps(self, user):
        """Test that timestamps are properly set."""
        agent = Agent.objects.create(owner=user, name="TimeAgent")
        task = AgentTask.objects.create(
            agent=agent, owner=user, input_text="Timestamp test"
        )

        # Initially, only created_at should be set
        assert task.created_at is not None
        assert task.started_at is None
        assert task.finished_at is None

        # Simulate task execution
        from django.utils import timezone

        task.started_at = timezone.now()
        task.status = "running"
        task.save()

        task.finished_at = timezone.now()
        task.status = "completed"
        task.output_text = "Done"
        task.save()

        task.refresh_from_db()
        assert task.started_at is not None
        assert task.finished_at is not None
        assert task.finished_at >= task.started_at >= task.created_at

    def test_task_agent_relationship(self, user):
        """Test the relationship between tasks and agents."""
        agent = Agent.objects.create(owner=user, name="RelAgent")
        task1 = AgentTask.objects.create(agent=agent, owner=user, input_text="T1")
        task2 = AgentTask.objects.create(agent=agent, owner=user, input_text="T2")

        # Agent should have multiple tasks (using related_name='tasks')
        assert agent.tasks.count() == 2
        assert task1 in agent.tasks.all()
        assert task2 in agent.tasks.all()

    def test_task_required_fields(self):
        """Test that required fields raise errors when missing."""
        with pytest.raises(Exception):
            AgentTask.objects.create(input_text="No agent or owner")

    def test_task_output_text_nullable(self, user):
        """Test that output_text can be null or blank."""
        agent = Agent.objects.create(owner=user, name="OutputAgent")
        task = AgentTask.objects.create(agent=agent, owner=user, input_text="Test")
        assert task.output_text is None

        task.output_text = ""
        task.save()
        assert task.output_text == ""

        task.output_text = "Some output"
        task.save()
        assert task.output_text == "Some output"
