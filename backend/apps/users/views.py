"""
User views - API endpoints for authentication and user management.
Following HackSoft Django Styleguide - views are thin and delegate to services/selectors.
"""
from django.contrib.auth.signals import (
    user_logged_in,
    user_logged_out,
    user_login_failed,
)
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from .serializers import (
    UserLoginSerializer,
    UserProfileSerializer,
    UserRegistrationSerializer,
    UserSerializer,
)
from .services import authenticate_user, register_user, update_user_profile


class RegisterView(APIView):
    """
    API endpoint for user registration.
    POST /api/auth/register/
    """

    permission_classes = [AllowAny]
    serializer_class = UserRegistrationSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Use service to create user (business logic separation)
        user = register_user(**serializer.validated_data)

        # Generate JWT tokens for auto-login after registration
        refresh = RefreshToken.for_user(user)

        # Trigger user_logged_in signal (registration auto-logs in)
        user_logged_in.send(sender=user.__class__, request=request, user=user)

        return Response(
            {
                "user": UserSerializer(user).data,
                "tokens": {
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                },
                "message": "User registered successfully",
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(TokenObtainPairView):
    """
    API endpoint for user login.
    POST /api/auth/login/
    Returns JWT access and refresh tokens.

    Inherits from simplejwt's TokenObtainPairView for standard JWT authentication.
    """

    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        # Try to authenticate and get tokens
        response = super().post(request, *args, **kwargs)

        # If successful (status 200), trigger user_logged_in signal
        if response.status_code == 200:
            # Get the user from the validated credentials
            from django.contrib.auth import get_user_model

            User = get_user_model()
            username = request.data.get("username")
            try:
                user = User.objects.get(username=username)
                # Send the signal (this triggers our signal handlers)
                user_logged_in.send(sender=user.__class__, request=request, user=user)
            except User.DoesNotExist:
                pass
        else:
            # Login failed, trigger user_login_failed signal
            user_login_failed.send(
                sender=self.__class__,
                credentials={"username": request.data.get("username")},
                request=request,
            )

        return response


class LogoutView(APIView):
    """
    API endpoint for user logout.
    POST /api/auth/logout/
    Blacklists the refresh token.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if not refresh_token:
                return Response(
                    {"error": "Refresh token is required"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            token = RefreshToken(refresh_token)
            token.blacklist()

            # Trigger user_logged_out signal
            user_logged_out.send(
                sender=request.user.__class__, request=request, user=request.user
            )

            return Response(
                {"message": "Logged out successfully"}, status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {"error": "Invalid token or token already blacklisted"},
                status=status.HTTP_400_BAD_REQUEST,
            )


class CurrentUserView(APIView):
    """
    API endpoint to get current authenticated user info.
    GET /api/auth/me/
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)


class UserProfileView(APIView):
    """
    API endpoint for viewing and updating user profile.
    GET /api/auth/profile/ - View profile
    PATCH /api/auth/profile/ - Update profile
    """

    permission_classes = [IsAuthenticated]
    serializer_class = UserProfileSerializer

    def get(self, request):
        """Get current user's profile."""
        serializer = self.serializer_class(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request):
        """Update current user's profile."""
        serializer = self.serializer_class(
            request.user, data=request.data, partial=True
        )
        serializer.is_valid(raise_exception=True)

        # Use service to update user (business logic separation)
        updated_user = update_user_profile(
            user=request.user, **serializer.validated_data
        )

        return Response(
            self.serializer_class(updated_user).data, status=status.HTTP_200_OK
        )
