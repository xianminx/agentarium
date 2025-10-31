from rest_framework.routers import DefaultRouter
from .views import AgentViewSet

router = DefaultRouter()
router.register(r"agents", AgentViewSet)

urlpatterns = router.urls
