import time
import logging

logger = logging.getLogger(__name__)


class RequestLoggingMiddleware:
    """Log request path, user, IP, and latency."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        start = time.time()
        ip = request.META.get("REMOTE_ADDR")

        response = self.get_response(request)

        # Get user after response (view has processed, DRF auth has run)
        user = "anon"
        if hasattr(request, "user"):
            if (
                hasattr(request.user, "is_authenticated")
                and request.user.is_authenticated
            ):
                user = request.user.username
            elif hasattr(request.user, "username"):
                user = request.user.username

        duration = (time.time() - start) * 1000
        logger.info(
            f"[{user}] {request.method} {request.path} "
            f"{response.status_code} {duration:.2f}ms from {ip}"
        )
        return response
