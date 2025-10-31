

from rest_framework.routers import DefaultRouter
from apps.agents.views import AgentViewSet
from apps.tasks.views import TaskViewSet

router = DefaultRouter()
router.register("agents", AgentViewSet, basename="agent")
router.register("tasks", TaskViewSet, basename="task")

urlpatterns = router.urls
