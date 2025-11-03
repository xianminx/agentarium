"""
User services - Business logic for user management.
Following HackSoft Django Styleguide - all business logic lives in services.
"""
from typing import Optional

from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.db import transaction


@transaction.atomic
def register_user(
    *,
    username: str,
    email: str,
    password: str,
    first_name: str = "",
    last_name: str = "",
) -> User:
    """
    Create a new user with hashed password.

    Args:
        username: Unique username
        email: User's email address
        password: Plain text password (will be hashed)
        first_name: Optional first name
        last_name: Optional last name

    Returns:
        Created User instance

    Raises:
        ValidationError: If user creation fails
    """
    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
        first_name=first_name,
        last_name=last_name,
    )
    return user


def authenticate_user(*, username: str, password: str) -> Optional[User]:
    """
    Authenticate user with username and password.

    Args:
        username: Username
        password: Plain text password

    Returns:
        User instance if authentication succeeds, None otherwise
    """
    user = authenticate(username=username, password=password)
    return user


@transaction.atomic
def update_user_profile(*, user: User, **kwargs) -> User:
    """
    Update user profile fields.

    Args:
        user: User instance to update
        **kwargs: Fields to update (email, first_name, last_name, etc.)

    Returns:
        Updated User instance
    """
    for field, value in kwargs.items():
        if hasattr(user, field):
            setattr(user, field, value)

    user.full_clean()  # Validate before saving
    user.save()
    return user


@transaction.atomic
def change_user_password(*, user: User, old_password: str, new_password: str) -> bool:
    """
    Change user password after verifying old password.

    Args:
        user: User instance
        old_password: Current password
        new_password: New password

    Returns:
        True if password changed successfully, False otherwise
    """
    if not user.check_password(old_password):
        return False

    user.set_password(new_password)
    user.save()
    return True
