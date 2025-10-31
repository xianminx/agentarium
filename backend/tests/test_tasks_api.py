import pytest
from apps.agents.models import Agent
from apps.tasks.models import AgentTask
from django.urls import reverse

@pytest.mark.django_db
def test_run_task_creates_and_triggers(api_client, user):
    agent = Agent.objects.create(name="a", owner=user)
    url = reverse("task-run")  # depends on router naming; check router
    resp = api_client.post("/api/tasks/run/", {"agent": agent.id, "input_text": "hello"})
    assert resp.status_code == 201
    data = resp.json()
    assert data["agent"] == agent.id
    assert data["status"] == "pending"
    assert AgentTask.objects.filter(id=data["id"]).exists()

@pytest.mark.django_db
def test_task_list_filters(api_client, user):
    agent = Agent.objects.create(name="a", owner=user)
    AgentTask.objects.create(agent=agent, owner=user, input_text="1", status="completed")
    AgentTask.objects.create(agent=agent, owner=user, input_text="2", status="pending")
    resp = api_client.get("/api/tasks/?status=completed")
    assert resp.status_code == 200
    assert resp.json()["results"][0]["status"] == "completed"
