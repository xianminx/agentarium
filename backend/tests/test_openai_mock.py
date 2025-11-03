import pytest
from apps.agents.models import Agent
from apps.tasks.models import AgentTask


@pytest.mark.django_db
def test_run_agent_sync_mocked(monkeypatch, user):
    agent = Agent.objects.create(
        owner=user, name="MockAgent", description="You are helpful"
    )
    task = AgentTask.objects.create(agent=agent, owner=user, input_text="Say hi")

    # monkeypatch the openai wrapper to return predictable content
    def fake_run(agent_obj, prompt, max_tokens=1024):
        assert agent_obj.id == agent.id
        assert "Say hi" in prompt
        return "Hello from mock"

    monkeypatch.setattr("utils.openai_client.run_agent_sync", fake_run)
    # Also patch it in the tasks module since it imports it
    monkeypatch.setattr("apps.tasks.tasks.run_agent_sync", fake_run)
    # call worker sync (simulate celery worker)
    from apps.tasks.tasks import run_agent_task_async

    # Call the underlying function directly (not as a Celery task)
    run_agent_task_async(task.id)
    task.refresh_from_db()
    assert task.status == AgentTask.STATUS_COMPLETED
    assert "Hello from mock" in task.output_text
