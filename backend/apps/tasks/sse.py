import json
import time
from django.http import StreamingHttpResponse
from django.utils.timezone import now
from .models import AgentTask


def task_event_stream():
    """Generator yielding updates every 2 seconds."""
    last_check = now()
    while True:
        # Fetch tasks updated after last_check
        updates = AgentTask.objects.filter(updated_at__gte=last_check)
        last_check = now()

        for task in updates:
            data = {
                "id": task.id,
                "status": task.status,
                "output": task.output or "",
                "updated_at": task.updated_at.isoformat(),
            }
            yield f"data: {json.dumps(data)}\n\n"

        time.sleep(2)


def task_stream_view(request):
    response = StreamingHttpResponse(
        task_event_stream(), content_type="text/event-stream"
    )
    response["Cache-Control"] = "no-cache"
    return response
