import pytest
from apps.agents.models import Agent
from apps.tasks.models import AgentTask
from django.urls import reverse
from apps.tasks.tasks import run_agent_task_async


@pytest.mark.django_db
def test_run_action_creates_task_and_triggers(api_client, user, monkeypatch):
    # Create an agent owned by user
    agent = Agent.objects.create(owner=user, name="A1")
    # Monkeypatch the Celery delay to simulate background run (so tests don't require running worker)
    called = {}
    def fake_delay(task_id):
        called["id"] = task_id
        # emulate immediate sync behavior by calling the worker function inline:
        run_agent_task_async(task_id)
    monkeypatch.setattr("apps.tasks.tasks.run_agent_task_async.delay", fake_delay)

    resp = api_client.post("/api/tasks/run/", {"agent": agent.id, "input_text": "Hello world"})
    assert resp.status_code == 201
    data = resp.json()
    assert data["agent"] == agent.id
    assert data["status"] in ("pending", "running", "completed", "failed")
    assert AgentTask.objects.filter(id=data["id"]).exists()
    # ensure the fake_delay saw the task id
    assert "id" in called

@pytest.mark.django_db
def test_task_list_filters(api_client, user):
    agent = Agent.objects.create(owner=user, name="A2")
    AgentTask.objects.create(agent=agent, owner=user, input_text="1", status="completed")
    AgentTask.objects.create(agent=agent, owner=user, input_text="2", status="pending")
    resp = api_client.get("/api/tasks/", {"status": "completed"})
    assert resp.status_code == 200
    body = resp.json()
    # pagination style; results under "results" if using LimitOffsetPagination
    results = body.get("results", body)
    assert any(r["status"] == "completed" for r in results)
