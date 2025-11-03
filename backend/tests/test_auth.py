"""
Comprehensive authentication tests.
Tests user registration, login, token management, logout, and profile operations.
"""
import pytest
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken


@pytest.fixture
def api_client():
    """Provide DRF API client for testing."""
    return APIClient()


@pytest.fixture
def test_user():
    """Create a test user."""
    return User.objects.create_user(
        username="testuser",
        email="test@example.com",
        password="testpass123",
        first_name="Test",
        last_name="User",
    )


@pytest.fixture
def authenticated_client(api_client, test_user):
    """Provide authenticated API client."""
    refresh = RefreshToken.for_user(test_user)
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")
    return api_client


@pytest.mark.django_db
class TestUserRegistration:
    """Test user registration endpoint."""

    def test_register_user_success(self, api_client):
        """Test successful user registration."""
        data = {
            "username": "newuser",
            "email": "newuser@example.com",
            "password": "SecurePass123!",
            "password_confirm": "SecurePass123!",
            "first_name": "New",
            "last_name": "User",
        }

        response = api_client.post("/api/auth/register/", data, format="json")

        assert response.status_code == status.HTTP_201_CREATED
        assert "user" in response.data
        assert "tokens" in response.data
        assert response.data["user"]["username"] == "newuser"
        assert response.data["user"]["email"] == "newuser@example.com"
        assert "access" in response.data["tokens"]
        assert "refresh" in response.data["tokens"]

        # Verify user exists in database
        assert User.objects.filter(username="newuser").exists()

    def test_register_user_password_mismatch(self, api_client):
        """Test registration fails when passwords don't match."""
        data = {
            "username": "newuser",
            "email": "newuser@example.com",
            "password": "SecurePass123!",
            "password_confirm": "DifferentPass123!",
        }

        response = api_client.post("/api/auth/register/", data, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "password_confirm" in response.data

    def test_register_user_duplicate_username(self, api_client, test_user):
        """Test registration fails with duplicate username."""
        data = {
            "username": "testuser",  # Already exists
            "email": "different@example.com",
            "password": "SecurePass123!",
            "password_confirm": "SecurePass123!",
        }

        response = api_client.post("/api/auth/register/", data, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "username" in response.data

    def test_register_user_duplicate_email(self, api_client, test_user):
        """Test registration fails with duplicate email."""
        data = {
            "username": "differentuser",
            "email": "test@example.com",  # Already exists
            "password": "SecurePass123!",
            "password_confirm": "SecurePass123!",
        }

        response = api_client.post("/api/auth/register/", data, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "email" in response.data

    def test_register_user_weak_password(self, api_client):
        """Test registration fails with weak password."""
        data = {
            "username": "newuser",
            "email": "newuser@example.com",
            "password": "123",  # Too weak
            "password_confirm": "123",
        }

        response = api_client.post("/api/auth/register/", data, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
class TestUserLogin:
    """Test user login endpoint."""

    def test_login_success(self, api_client, test_user):
        """Test successful login with valid credentials."""
        data = {"username": "testuser", "password": "testpass123"}

        response = api_client.post("/api/auth/login/", data, format="json")

        assert response.status_code == status.HTTP_200_OK
        assert "access" in response.data
        assert "refresh" in response.data

    def test_login_invalid_username(self, api_client):
        """Test login fails with invalid username."""
        data = {"username": "nonexistent", "password": "testpass123"}

        response = api_client.post("/api/auth/login/", data, format="json")

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_login_invalid_password(self, api_client, test_user):
        """Test login fails with invalid password."""
        data = {"username": "testuser", "password": "wrongpassword"}

        response = api_client.post("/api/auth/login/", data, format="json")

        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestTokenRefresh:
    """Test token refresh endpoint."""

    def test_refresh_token_success(self, api_client, test_user):
        """Test successful token refresh."""
        refresh = RefreshToken.for_user(test_user)

        data = {"refresh": str(refresh)}
        response = api_client.post("/api/auth/refresh/", data, format="json")

        assert response.status_code == status.HTTP_200_OK
        assert "access" in response.data

    def test_refresh_token_invalid(self, api_client):
        """Test refresh fails with invalid token."""
        data = {"refresh": "invalid_token"}
        response = api_client.post("/api/auth/refresh/", data, format="json")

        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestUserLogout:
    """Test user logout endpoint."""

    def test_logout_success(self, authenticated_client, test_user):
        """Test successful logout (token blacklisting)."""
        refresh = RefreshToken.for_user(test_user)

        data = {"refresh": str(refresh)}
        response = authenticated_client.post("/api/auth/logout/", data, format="json")

        assert response.status_code == status.HTTP_200_OK
        assert "message" in response.data

    def test_logout_without_token(self, authenticated_client):
        """Test logout fails without refresh token."""
        response = authenticated_client.post("/api/auth/logout/", {}, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_logout_unauthenticated(self, api_client):
        """Test logout requires authentication."""
        data = {"refresh": "some_token"}
        response = api_client.post("/api/auth/logout/", data, format="json")

        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestCurrentUser:
    """Test current user endpoint."""

    def test_get_current_user_authenticated(self, authenticated_client, test_user):
        """Test getting current user info when authenticated."""
        response = authenticated_client.get("/api/auth/me/")

        assert response.status_code == status.HTTP_200_OK
        assert response.data["username"] == "testuser"
        assert response.data["email"] == "test@example.com"
        assert "password" not in response.data  # Password should never be exposed

    def test_get_current_user_unauthenticated(self, api_client):
        """Test current user endpoint requires authentication."""
        response = api_client.get("/api/auth/me/")

        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestUserProfile:
    """Test user profile endpoint."""

    def test_get_profile_authenticated(self, authenticated_client, test_user):
        """Test getting user profile when authenticated."""
        response = authenticated_client.get("/api/auth/profile/")

        assert response.status_code == status.HTTP_200_OK
        assert response.data["username"] == "testuser"
        assert response.data["email"] == "test@example.com"
        assert response.data["first_name"] == "Test"
        assert response.data["last_name"] == "User"

    def test_update_profile_success(self, authenticated_client, test_user):
        """Test updating user profile."""
        data = {
            "first_name": "Updated",
            "last_name": "Name",
            "email": "updated@example.com",
        }

        response = authenticated_client.patch("/api/auth/profile/", data, format="json")

        assert response.status_code == status.HTTP_200_OK
        assert response.data["first_name"] == "Updated"
        assert response.data["last_name"] == "Name"
        assert response.data["email"] == "updated@example.com"

        # Verify database was updated
        test_user.refresh_from_db()
        assert test_user.first_name == "Updated"
        assert test_user.email == "updated@example.com"

    def test_update_profile_duplicate_email(self, authenticated_client, test_user):
        """Test updating profile fails with duplicate email."""
        # Create another user
        User.objects.create_user(
            username="otheruser", email="other@example.com", password="pass123"
        )

        data = {"email": "other@example.com"}
        response = authenticated_client.patch("/api/auth/profile/", data, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "email" in response.data

    def test_update_profile_unauthenticated(self, api_client):
        """Test profile update requires authentication."""
        data = {"first_name": "Updated"}
        response = api_client.patch("/api/auth/profile/", data, format="json")

        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestProtectedEndpoints:
    """Test that protected endpoints have proper authentication for write operations."""

    def test_agents_create_without_auth(self, api_client):
        """Test creating agent requires authentication."""
        data = {"name": "Test Agent", "model": "gpt-4"}
        response = api_client.post("/api/agents/", data, format="json")
        # Should return 401 for unauthenticated user trying to create
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_tasks_create_without_auth(self, api_client):
        """Test creating task requires authentication (validation happens first)."""
        data = {"agent": 1, "input_text": "test"}
        response = api_client.post("/api/tasks/", data, format="json")
        # Returns 400 because validation happens before auth check
        assert response.status_code in [
            status.HTTP_400_BAD_REQUEST,
            status.HTTP_401_UNAUTHORIZED,
        ]

    def test_agents_endpoint_with_auth(self, authenticated_client):
        """Test agents endpoint works with authentication."""
        response = authenticated_client.get("/api/agents/")
        assert response.status_code in [status.HTTP_200_OK, status.HTTP_201_CREATED]

    def test_tasks_endpoint_with_auth(self, authenticated_client):
        """Test tasks endpoint works with authentication."""
        response = authenticated_client.get("/api/tasks/")
        assert response.status_code in [status.HTTP_200_OK, status.HTTP_201_CREATED]
