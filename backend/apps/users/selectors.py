"""
User selectors - Query logic for user data retrieval.
Following HackSoft Django Styleguide - all query logic lives in selectors.
"""
from typing import Optional

from django.contrib.auth.models import User
from django.core.exceptions import ObjectDoesNotExist


def get_user_by_id(*, user_id: int) -> Optional[User]:
    """
    Retrieve user by ID.

    Args:
        user_id: User's primary key

    Returns:
        User instance if found, None otherwise
    """
    try:
        return User.objects.get(pk=user_id)
    except ObjectDoesNotExist:
        return None


def get_user_by_username(*, username: str) -> Optional[User]:
    """
    Retrieve user by username.

    Args:
        username: Username to search for

    Returns:
        User instance if found, None otherwise
    """
    try:
        return User.objects.get(username=username)
    except ObjectDoesNotExist:
        return None


def get_user_by_email(*, email: str) -> Optional[User]:
    """
    Retrieve user by email address.

    Args:
        email: Email to search for

    Returns:
        User instance if found, None otherwise
    """
    try:
        return User.objects.get(email=email)
    except ObjectDoesNotExist:
        return None


def user_exists(*, username: str = None, email: str = None) -> bool:
    """
    Check if a user exists with the given username or email.

    Args:
        username: Optional username to check
        email: Optional email to check

    Returns:
        True if user exists, False otherwise
    """
    query = User.objects.all()

    if username:
        query = query.filter(username=username)
    if email:
        query = query.filter(email=email)

    return query.exists()
