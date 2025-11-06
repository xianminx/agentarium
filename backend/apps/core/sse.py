"""
Server-Sent Events (SSE) endpoint for streaming system signals.
"""
import json
import time

from django.http import StreamingHttpResponse
from django.views.decorators.http import require_http_methods

from .signal_events import signal_event_queue


def signal_event_stream():
    """
    Generator yielding signal events as they occur.
    Checks for new events every second.
    """
    last_index = 0

    while True:
        # Get new events since last check
        events = signal_event_queue.get_events(since_index=last_index)

        if events:
            for event in events:
                yield f"data: {json.dumps(event)}\n\n"
            last_index += len(events)

        # Send keepalive comment every second to prevent timeout
        yield ": keepalive\n\n"
        time.sleep(1)


@require_http_methods(["GET"])
def signal_stream_view(request):
    """
    SSE endpoint for streaming system signals.
    Only accessible to superusers.
    Supports authentication via query parameter for SSE compatibility.
    """
    from django.http import JsonResponse
    from rest_framework_simplejwt.authentication import JWTAuthentication
    from rest_framework_simplejwt.exceptions import InvalidToken

    # Try to authenticate using JWT from query parameter
    token = request.GET.get("token")

    if token:
        try:
            jwt_auth = JWTAuthentication()
            validated_token = jwt_auth.get_validated_token(token)
            user = jwt_auth.get_user(validated_token)
            request.user = user
        except InvalidToken:
            return JsonResponse({"error": "Invalid token"}, status=401)

    print("Authenticated user:", request.user)
    # Check if user is authenticated and is a superuser
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Authentication required"}, status=401)

    if not request.user.is_superuser:
        return JsonResponse({"error": "Superuser access required"}, status=403)

    response = StreamingHttpResponse(
        signal_event_stream(), content_type="text/event-stream"
    )
    response["Cache-Control"] = "no-cache"
    response["X-Accel-Buffering"] = "no"  # Disable buffering in nginx
    return response
