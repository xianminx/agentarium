import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

User = get_user_model()


@pytest.fixture
def user(db):
    return User.objects.create_user(
        username="testuser", email="t@t.com", password="pass"
    )


@pytest.fixture
def api_client(user):
    client = APIClient()
    # obtain JWT or use force_authenticate; example: force_authenticate
    client.force_authenticate(user=user)
    return client
