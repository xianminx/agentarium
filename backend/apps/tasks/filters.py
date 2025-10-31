import django_filters
from .models import AgentTask

class AgentTaskFilter(django_filters.FilterSet):
    created_at__gte = django_filters.IsoDateTimeFilter(field_name="created_at", lookup_expr="gte")
    created_at__lte = django_filters.IsoDateTimeFilter(field_name="created_at", lookup_expr="lte")
    status = django_filters.CharFilter(field_name="status")
    agent = django_filters.NumberFilter(field_name="agent__id")

    class Meta:
        model = AgentTask
        fields = ["status", "agent", "created_at__gte", "created_at__lte"]
