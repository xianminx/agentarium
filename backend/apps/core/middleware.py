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
        user = getattr(request.user, "username", "anon")

        response = self.get_response(request)

        duration = (time.time() - start) * 1000
        logger.info(f"[{user}] {request.method} {request.path} "
                    f"{response.status_code} {duration:.2f}ms from {ip}")
        return response
