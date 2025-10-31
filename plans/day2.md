
# Day 2 — API Design Depth, Permissions, and Query Efficiency (step-by-step)

## 0. Prep: install packages & project assumptions

Assume you already scaffolded `agentarium_backend` and `agentarium_frontend` from Day 1 and have python venv + node installed.

Install backend deps:

```bash
# inside backend venv
uv add  django djangorestframework djangorestframework-simplejwt django-filter psycopg2-binary celery redis pytest pytest-django pytest-cov factory-boy
```

Add to `INSTALLED_APPS` in `settings/base.py`:

```py
INSTALLED_APPS = [
    # ...
    "rest_framework",
    "rest_framework.authtoken",
    "django_filters",
    "apps.agents",
    "apps.tasks",
    "apps.users",
    # ...
]
```

Add DRF settings (in `settings/base.py`):

```py
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
    "DEFAULT_FILTER_BACKENDS": (
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.OrderingFilter",
        "rest_framework.filters.SearchFilter",
    ),
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.LimitOffsetPagination",
    "PAGE_SIZE": 20,
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.UserRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {
        "user": "60/min",  # example, adjust as needed
    },
}
```

Create migrations, run DB:

```bash
python manage.py makemigrations
python manage.py migrate
```

---

## 1. Models recap (agents & tasks) — keep owner relations

`agents/models.py`

```py
from django.db import models
from django.conf import settings

class Agent(models.Model):
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="agents")
    name = models.CharField(max_length=120)
    description = models.TextField(blank=True)
    model = models.CharField(max_length=50, default="gpt-4o-mini")
    temperature = models.FloatField(default=0.7)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
```

`tasks/models.py`

```py
from django.db import models
from django.conf import settings
from agents.models import Agent

class AgentTask(models.Model):
    STATUS_CHOICES = [
        ("pending","pending"),
        ("running","running"),
        ("completed","completed"),
        ("failed","failed"),
    ]
    agent = models.ForeignKey(Agent, on_delete=models.CASCADE, related_name="tasks")
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="tasks")
    input_text = models.TextField()
    output_text = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    created_at = models.DateTimeField(auto_now_add=True)
    started_at = models.DateTimeField(null=True, blank=True)
    finished_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]
```

Notes:

* Keep `owner` on tasks for strict object-level permission enforcement and multi-user isolation.
* Use `related_name` to simplify prefetching.

---

## 2. Serializer composition (nested, writable, custom fields)

`agents/serializers.py`

```py
from rest_framework import serializers
from .models import Agent
from tasks.serializers import AgentTaskSerializer

class AgentSerializer(serializers.ModelSerializer):
    tasks_count = serializers.IntegerField(read_only=True)
    recent_tasks = AgentTaskSerializer(many=True, read_only=True)

    class Meta:
        model = Agent
        fields = ["id","name","description","model","temperature","created_at","tasks_count","recent_tasks"]
```

`tasks/serializers.py`

```py
from rest_framework import serializers
from .models import AgentTask

class AgentTaskSerializer(serializers.ModelSerializer):
    agent_name = serializers.CharField(source='agent.name', read_only=True)

    class Meta:
        model = AgentTask
        fields = ["id","agent","agent_name","input_text","output_text","status","created_at","started_at","finished_at"]
        read_only_fields = ["output_text","status","started_at","finished_at"]
```

Writable nested example (if you want to create task inside agent serializer):

```py
# only if you need writable nested - generally keep tasks created via /tasks endpoint
class AgentWithTasksCreateSerializer(serializers.ModelSerializer):
    tasks = AgentTaskSerializer(many=True, required=False)

    def create(self, validated_data):
        tasks_data = validated_data.pop("tasks", [])
        agent = Agent.objects.create(**validated_data)
        for t in tasks_data:
            AgentTask.objects.create(agent=agent, owner=self.context['request'].user, **t)
        return agent
```

Best practice: prefer separate endpoints for tasks; use nested read-only for UI convenience.

---

## 3. Object-level permissions & custom DRF permission

Create a permission to allow only owners to modify:

`core/permissions.py`

```py
from rest_framework import permissions

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Object-level permission: only owners can edit/delete.
    """

    def has_object_permission(self, request, view, obj):
        # Read permissions allowed to any authenticated user if you want,
        # but here we restrict read to owner as well:
        if request.method in permissions.SAFE_METHODS:
            return obj.owner == request.user
        return obj.owner == request.user
```

Use it in ViewSets.

---

## 4. Filtering & pagination with `django-filter`

Install `django-filter` (done above).

`tasks/filters.py`

```py
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
```

Hook it up in view.

---

## 5. /tasks/run/ custom action — ViewSet, throttling, optimized queries

`tasks/views.py`

```py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from .models import AgentTask
from .serializers import AgentTaskSerializer
from agents.models import Agent
from .filters import AgentTaskFilter
from rest_framework.throttling import UserRateThrottle

class TaskViewSet(viewsets.ModelViewSet):
    queryset = AgentTask.objects.select_related("agent","owner").all()
    serializer_class = AgentTaskSerializer
    permission_classes = [IsAuthenticated]  # object-level checked further
    filterset_class = AgentTaskFilter
    ordering_fields = ["created_at","status","agent__name"]
    throttle_classes = [UserRateThrottle]

    def get_queryset(self):
        # enforce multi-tenant / owner isolation + query optimization
        qs = super().get_queryset().filter(owner=self.request.user)
        # prefetch recent related data if needed (e.g., agent's other fields)
        qs = qs.select_related("agent")
        return qs

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=False, methods=["post"], url_path="run", url_name="run")
    def run(self, request):
        """
        Create a task and trigger the async run (Celery). Returns created task.
        Payload: { "agent": agent_id, "input_text": "..." }
        """
        agent_id = request.data.get("agent")
        input_text = request.data.get("input_text")
        try:
            agent = Agent.objects.get(pk=agent_id, owner=request.user)
        except Agent.DoesNotExist:
            return Response({"detail":"Agent not found"}, status=status.HTTP_404_NOT_FOUND)

        task = AgentTask.objects.create(agent=agent, owner=request.user, input_text=input_text, status="pending")
        # trigger Celery async job (Day 3 deep) — example:
        from tasks.tasks import run_agent_task_async  # celery task
        run_agent_task_async.delay(task.id)
        serializer = self.get_serializer(task)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
```

Notes:

* `select_related("agent","owner")` optimizes join fetching.
* Throttling via `UserRateThrottle` configured in DRF settings; you can write custom throttle class if needed.

---

## 6. ORM optimization patterns (select_related, prefetch_related, only, defer)

Examples / best practices:

* When retrieving tasks and showing the agent name and owner: use `select_related("agent","owner")` because these are FK.
* When you only need a few fields:

  ```py
  qs = Agent.objects.only("id","name","model")
  ```
* For reverse FK relationships (Agent -> tasks), use `prefetch_related`:

  ```py
  agents = Agent.objects.filter(owner=user).prefetch_related(
      Prefetch("tasks", queryset=AgentTask.objects.order_by("-created_at")[:5])
  )
  ```
* Use `defer()` to avoid large text fields:

  ```py
  qs = AgentTask.objects.defer("output_text")  # if you don't need output text
  ```

Add indexes for commonly filtered fields in migrations for `status`, `created_at`, `agent` if the table gets large.

---

## 7. Throttling & rate limits (custom token-based throttle)

If you want token-based throttling (per API token), write custom throttle:

`core/throttles.py`

```py
from rest_framework.throttling import SimpleRateThrottle

class UserTokenRateThrottle(SimpleRateThrottle):
    scope = "user_token"

    def get_cache_key(self, request, view):
        if not request.user or not request.auth:
            return None
        # request.auth may be token-like; pick unique token id
        ident = str(request.auth)
        return self.cache_format % {
            "scope": self.scope,
            "ident": ident
        }
```

Add `"user_token": "30/min"` to `DEFAULT_THROTTLE_RATES` to use it.

---

## 8. Testing APIs with `APIClient` (pytest examples)

`tests/conftest.py` (pytest fixtures)

```py
import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

User = get_user_model()

@pytest.fixture
def user(db):
    return User.objects.create_user(username="testuser", email="t@t.com", password="pass")

@pytest.fixture
def api_client(user):
    client = APIClient()
    # obtain JWT or use force_authenticate; example: force_authenticate
    client.force_authenticate(user=user)
    return client
```

`tests/test_tasks_api.py`

```py
import pytest
from agents.models import Agent
from tasks.models import AgentTask
from django.urls import reverse

@pytest.mark.django_db
def test_run_task_creates_and_triggers(api_client, user):
    agent = Agent.objects.create(name="a", owner=user)
    url = reverse("task-run")  # depends on router naming; check router
    resp = api_client.post("/api/tasks/run/", {"agent": agent.id, "input_text": "hello"})
    assert resp.status_code == 201
    data = resp.json()
    assert data["agent"] == agent.id
    assert data["status"] == "pending"
    assert AgentTask.objects.filter(id=data["id"]).exists()

@pytest.mark.django_db
def test_task_list_filters(api_client, user):
    agent = Agent.objects.create(name="a", owner=user)
    AgentTask.objects.create(agent=agent, owner=user, input_text="1", status="completed")
    AgentTask.objects.create(agent=agent, owner=user, input_text="2", status="pending")
    resp = api_client.get("/api/tasks/?status=completed")
    assert resp.status_code == 200
    assert resp.json()["results"][0]["status"] == "completed"
```

Run tests:

```bash
pytest -q
```

Mocking external calls (OpenAI) — use `monkeypatch` to replace the client in tests.

---

## 9. Frontend: Agent CRUD UI, Task filters, Toast feedback

Assume Vite + TS + React + tailwind + shadcn installed. Use React Query for API data.

Install client deps:

```bash
npm install axios @tanstack/react-query react-router-dom
```

`src/lib/api.ts` — axios with JWT handling

```ts
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "http://localhost:8000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
```

`src/hooks/useAgents.ts`

```ts
import { useQuery } from "@tanstack/react-query";
import api from "../lib/api";

export function useAgents() {
  return useQuery(["agents"], async () => {
    const { data } = await api.get("/agents/");
    return data;
  }, { staleTime: 5000 });
}
```

`src/components/AgentList.tsx`

```tsx
import React from "react";
import { useAgents } from "../hooks/useAgents";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast"; // shadcn style

export default function AgentList({ onEdit }) {
  const { data, isLoading, error } = useAgents();
  const { toast } = useToast();

  if (isLoading) return <div>Loading…</div>;
  if (error) return <div>Error</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h3 className="text-lg font-semibold">Agents</h3>
        <Button onClick={() => onEdit(null)}>New Agent</Button>
      </div>

      <div className="grid gap-4">
        {data.map((a) => (
          <div key={a.id} className="p-4 rounded-xl bg-white/5 flex justify-between items-center">
            <div>
              <div className="font-medium">{a.name}</div>
              <div className="text-sm text-slate-400">{a.model} • {a.tasks_count ?? 0} tasks</div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => onEdit(a)}>Edit</Button>
              <Button onClick={() => {
                navigator.clipboard.writeText(a.id);
                toast({title: "Agent id copied"});
              }}>Copy ID</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

`src/components/TaskList.tsx` (filters + sorting)

```tsx
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../lib/api";

function useTasks(params) {
  return useQuery(["tasks", params], async () => {
    const { data } = await api.get("/tasks/", { params });
    return data;
  }, { keepPreviousData: true });
}

export default function TaskList() {
  const [filters, setFilters] = useState({ status: "", agent: "", ordering: "-created_at" });
  const { data, isLoading } = useTasks(filters);

  if (isLoading) return <div>Loading tasks…</div>;

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <select value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})}>
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="running">Running</option>
          <option value="completed">Completed</option>
        </select>
        <input placeholder="Agent id" value={filters.agent} onChange={e => setFilters({...filters, agent: e.target.value})} />
        <select value={filters.ordering} onChange={e => setFilters({...filters, ordering: e.target.value})}>
          <option value="-created_at">Newest</option>
          <option value="created_at">Oldest</option>
        </select>
      </div>

      <div className="space-y-3">
        {data.results.map(t => (
          <div key={t.id} className="p-3 rounded bg-white/5">
            <div className="flex justify-between">
              <div>
                <div className="font-medium">{t.agent_name}</div>
                <div className="text-sm text-slate-400">{t.input_text.slice(0,80)}</div>
              </div>
              <div className="text-sm">{t.status}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

Toast usage is via shadcn's `use-toast`. If you use their setup, call toast when tasks complete or on errors.

**Run frontend dev:**

```bash
cd agentarium_frontend
npm run dev
```

---

## 10. Extra: Apply DRF custom permission for tasks (owner-only edit)

`tasks/views.py` — add object permission enforcement:

```py
from rest_framework.exceptions import PermissionDenied
from core.permissions import IsOwnerOrReadOnly

class TaskViewSet(viewsets.ModelViewSet):
    # ... existing
    permission_classes = [IsOwnerOrReadOnly]

    def get_object(self):
        obj = super().get_object()
        if obj.owner != self.request.user:
            raise PermissionDenied("Not owner")
        return obj
```

Better: let `IsOwnerOrReadOnly` handle it; ensure view uses it.

---

## 11. Logging & structured responses (small tips)

* Use a custom DRF exception handler in `core/exception_handler.py` to return consistent API errors.
* Add middleware for request logging (IP, path, user).
* Add small helpers for performance: `@cached_property` for expensive computed fields.

---

## 12. Final tasks to complete Day 2 (checklist)

* [ ] Models confirmed & migrations applied.
* [ ] `AgentSerializer`, `AgentTaskSerializer` implemented.
* [ ] `TaskViewSet` with `run` action implemented and wired in router.
* [ ] `AgentViewSet` returns `tasks_count` and `recent_tasks` (or provide separate endpoint).
* [ ] `django-filter` filters for `AgentTaskFilter` registered and working.
* [ ] Owner object-level permission (`IsOwnerOrReadOnly`) applied.
* [ ] Throttling: configure `DEFAULT_THROTTLE_RATES` or custom throttle class.
* [ ] Query optimization: use `select_related`, `prefetch_related`, `only`, `defer`.
* [ ] Tests written for run action, list filtering, and permission behavior.
* [ ] Frontend: Agent CRUD UI (modal + table) implemented.
* [ ] Frontend: Task list implements filter/sort and toasts on actions.

---

## 13. Helpful snippets — router & urls

`api/urls.py`

```py
from rest_framework.routers import DefaultRouter
from agents.views import AgentViewSet
from tasks.views import TaskViewSet

router = DefaultRouter()
router.register("agents", AgentViewSet, basename="agent")
router.register("tasks", TaskViewSet, basename="task")

urlpatterns = router.urls
```

Remember naming patterns: the `run` action above will register as `tasks-run` if using `basename="task"` — check `reverse()` or hardcode `/api/tasks/run/`.

---

## 14. What I recommend you implement now (practical order)

1. Implement models & migrations.
2. Implement `AgentSerializer` + `AgentViewSet` (simple, with `get_queryset` filtering owner).
3. Implement `AgentTaskSerializer` + `TaskViewSet` with `run` action (without Celery yet — make run synchronous to validate the flow).
4. Implement `django-filter` filters and wire them to the `TaskViewSet`.
5. Add `IsOwnerOrReadOnly` and ensure `perform_create` sets `owner`.
6. Write minimal tests for run action & filters — run pytest.
7. Implement frontend AgentList and TaskList that call your endpoints.
8. Add throttling config and a custom throttle if desired.
9. Replace synchronous run with Celery invocation (Day 3) once Day 2 tests & UI pass.

---

If you want I can now:

* produce the **exact file tree + full file contents** for the backend pieces above (all models/serializers/views/filters/tests) so you can `git apply` them directly, **or**
* produce the **React modal + agent create/edit component code** and how to hook into React Query mutations (form + validation), or
* generate the **pytest test suite** with mocking for OpenAI.

Which of those should I generate next (I’ll output full code files)?
