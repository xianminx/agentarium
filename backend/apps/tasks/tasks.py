from celery import shared_task
from django.utils import timezone
from .models import AgentTask

# Import the openai wrapper to call the model (mockable in tests)
from utils.openai_client import run_agent_sync


@shared_task(bind=True)
def run_agent_task_async(self, task_id):
    """
    Celery task that runs an AgentTask using OpenAI and updates the DB.
    For Day 2 we provide this placeholder — Day 3 will cover retries, logging, streaming.
    """
    try:
        task = AgentTask.objects.select_related("agent").get(pk=task_id)
        task.status = AgentTask.STATUS_RUNNING
        task.started_at = timezone.now()
        task.save(update_fields=["status", "started_at"])

        # call OpenAI wrapper
        output = run_agent_sync(task.agent, task.input_text)
        task.output_text = output
        task.status = AgentTask.STATUS_COMPLETED
        task.finished_at = timezone.now()
        task.save(update_fields=["output_text", "status", "finished_at"])
        return {"status": "ok"}
    except Exception as ex:
        # mark failed
        try:
            task = AgentTask.objects.get(pk=task_id)
            task.status = AgentTask.STATUS_FAILED
            task.finished_at = timezone.now()
            task.save(update_fields=["status", "finished_at"])
        except Exception:
            pass
        raise
