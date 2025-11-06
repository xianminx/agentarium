import logging
from django.contrib.auth.signals import (
    user_logged_in,
    user_logged_out,
    user_login_failed,
)
from django.dispatch import receiver

from .signal_events import signal_event_queue

logger = logging.getLogger(__name__)


@receiver(user_logged_in)
def log_user_logged_in(sender, request, user, **kwargs):
    """
    Log when a user successfully logs in.
    """
    ip_address = get_client_ip(request)
    user_agent = request.META.get("HTTP_USER_AGENT", "Unknown")

    logger.info(
        f"User logged in: {user.username} (ID: {user.id}) from IP: {ip_address}, "
        f"User-Agent: {user_agent}"
    )

    # Add event to queue for live streaming
    signal_event_queue.add_event(
        signal_type="user_logged_in",
        event_data={
            "user_id": user.id,
            "username": user.username,
            "email": user.email,
            "ip_address": ip_address,
            "user_agent": user_agent,
        },
        level="info",
    )


@receiver(user_logged_out)
def log_user_logged_out(sender, request, user, **kwargs):
    """
    Log when a user logs out.
    """
    if user:
        ip_address = get_client_ip(request)
        logger.info(
            f"User logged out: {user.username} (ID: {user.id}) from IP: {ip_address}"
        )

        # Add event to queue for live streaming
        signal_event_queue.add_event(
            signal_type="user_logged_out",
            event_data={
                "user_id": user.id,
                "username": user.username,
                "ip_address": ip_address,
            },
            level="info",
        )
    else:
        logger.info("User logged out (anonymous session)")
        signal_event_queue.add_event(
            signal_type="user_logged_out",
            event_data={"message": "Anonymous session logged out"},
            level="info",
        )


@receiver(user_login_failed)
def log_user_login_failed(sender, credentials, request, **kwargs):
    """
    Log when a login attempt fails.
    """
    ip_address = get_client_ip(request) if request else "Unknown"
    username = credentials.get("username", "Unknown")
    user_agent = (
        request.META.get("HTTP_USER_AGENT", "Unknown") if request else "Unknown"
    )

    logger.warning(
        f"Failed login attempt for username: {username} from IP: {ip_address}, "
        f"User-Agent: {user_agent}"
    )

    # Add event to queue for live streaming
    signal_event_queue.add_event(
        signal_type="user_login_failed",
        event_data={
            "username": username,
            "ip_address": ip_address,
            "user_agent": user_agent,
        },
        level="warning",
    )


def get_client_ip(request):
    """
    Get the client's IP address from the request.
    Handles proxies by checking X-Forwarded-For header.
    """
    if not request:
        return "Unknown"

    x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
    if x_forwarded_for:
        ip = x_forwarded_for.split(",")[0].strip()
    else:
        ip = request.META.get("REMOTE_ADDR", "Unknown")
    return ip
