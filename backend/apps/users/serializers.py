"""
User serializers for registration, authentication, and profile management.
Following HackSoft Django Styleguide - serializers only handle validation and representation.
"""
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers


class UserSerializer(serializers.ModelSerializer):
    """Public user data serializer - excludes sensitive fields."""

    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name", "date_joined"]
        read_only_fields = ["id", "date_joined"]


class UserRegistrationSerializer(serializers.Serializer):
    """Serializer for user registration with password confirmation."""

    username = serializers.CharField(
        max_length=150,
        required=True,
        help_text="Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.",
    )
    email = serializers.EmailField(required=True)
    password = serializers.CharField(
        write_only=True, required=True, style={"input_type": "password"}
    )
    password_confirm = serializers.CharField(
        write_only=True, required=True, style={"input_type": "password"}
    )
    first_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    last_name = serializers.CharField(max_length=150, required=False, allow_blank=True)

    def validate_username(self, value: str) -> str:
        """Validate username is unique."""
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError(
                "A user with this username already exists."
            )
        return value

    def validate_email(self, value: str) -> str:
        """Validate email is unique."""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate(self, attrs: dict) -> dict:
        """Validate passwords match and meet Django's password requirements."""
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError(
                {"password_confirm": "Passwords do not match."}
            )

        # Use Django's built-in password validators
        validate_password(attrs["password"])

        # Remove password_confirm as we don't need it after validation
        attrs.pop("password_confirm")
        return attrs


class UserLoginSerializer(serializers.Serializer):
    """Serializer for user login - validates credentials."""

    username = serializers.CharField(required=True)
    password = serializers.CharField(
        write_only=True, required=True, style={"input_type": "password"}
    )


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for viewing and updating user profile.
    Includes editable fields: email, first_name, last_name.
    """

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "date_joined",
            "last_login",
        ]
        read_only_fields = ["id", "username", "date_joined", "last_login"]

    def validate_email(self, value: str) -> str:
        """Validate email is unique (excluding current user)."""
        user = self.instance
        if user and User.objects.filter(email=value).exclude(pk=user.pk).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value
