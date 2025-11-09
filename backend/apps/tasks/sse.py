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
                "agent": task.agent_id,
                "status": task.status,
                "output_text": task.output_text or "",
                "input_text": task.input_text,
                "created_at": task.created_at.isoformat(),
                "updated_at": task.updated_at.isoformat(),
                "started_at": task.started_at.isoformat() if task.started_at else None,
                "finished_at": task.finished_at.isoformat()
                if task.finished_at
                else None,
            }
            yield f"data: {json.dumps(data)}\n\n"

        time.sleep(2)


def task_stream_view(request):
    response = StreamingHttpResponse(
        task_event_stream(), content_type="text/event-stream"
    )
    response["Cache-Control"] = "no-cache"
    return response
