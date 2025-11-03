import pytest
from apps.agents.models import Agent
from django.urls import reverse


@pytest.mark.django_db
def test_create_agent(api_client, user):
    resp = api_client.post(
        "/api/agents/", {"name": "Alpha", "description": "A test agent"}
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["name"] == "Alpha"
    # Ensure owner created
    assert Agent.objects.filter(owner=user, name="Alpha").exists()


@pytest.mark.django_db
def test_agent_list_only_owner(api_client, user):
    # another user's agent
    other = User = None
    from django.contrib.auth import get_user_model

    U = get_user_model()
    other = U.objects.create_user(username="other", email="o@o.com", password="p")
    Agent.objects.create(owner=other, name="OtherAgent")
    # own agent
    Agent.objects.create(owner=user, name="MyAgent")
    resp = api_client.get("/api/agents/")
    assert resp.status_code == 200
    payload = resp.json()
    if isinstance(payload, dict) and "results" in payload:
        results = payload["results"]
    else:
        results = payload
    names = [a["name"] for a in results]
    assert "MyAgent" in names
    assert "OtherAgent" not in names
