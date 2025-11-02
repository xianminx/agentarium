# 🧱 **Day 4 – Real-Time Updates, Middleware, and Security**

## 🎯 **Objectives**

* Implement **Server-Sent Events (SSE)** for live task updates
* Add **custom middleware** for request tracing (IP, latency, user)
* Create **global exception handler** for DRF responses
* Configure **Redis caching** for performance
* Harden backend with **CORS, CSRF, HTTPS headers, and rate limits**

---

## 📂 **Updated Project Structure**

```
backend/
├── apps/
│   ├── agents/
│   ├── tasks/
│   │   ├── views.py
│   │   ├── sse.py              # new: real-time stream endpoint
│   │   ├── services.py         # new: task update broadcaster
│   │   ├── cache.py            # new: cache utilities
│   └── core/
│       ├── middleware.py       # new: custom request tracing middleware
│       ├── exceptions.py       # new: custom exception handler
│       ├── cache.py            # optional: centralized cache helpers
│
├── config/
│   ├── settings/
│   │   ├── base.py
│   │   ├── dev.py
│   │   ├── prod.py
│   └── urls.py
```

---

## 🧩 Step 1 — Real-Time Task Updates via SSE

SSE is lighter than WebSockets for one-way streaming and integrates easily into Django with `StreamingHttpResponse`.

### `tasks/sse.py`

```python
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
```

### `config/urls.py`

```python
from django.urls import path, include
from apps.tasks.sse import task_stream_view

urlpatterns = [
    path("api/", include("apps.tasks.urls")),
    path("stream/tasks/", task_stream_view, name="task-stream"),
]
```

### 🧠 Tip

Use Redis pub/sub for scale later (instead of DB polling):

* Worker publishes task status updates to a Redis channel
* SSE view subscribes and streams them

---

## ⚙️ Step 2 — Middleware for Request Tracing

### `core/middleware.py`

```python
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
```

### Add to `settings/base.py`

```python
MIDDLEWARE += [
    "apps.core.middleware.RequestLoggingMiddleware",
]
```

---

## 🚨 Step 3 — Custom Exception Handler

### `core/exceptions.py`

```python
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status

def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is None:
        return Response(
            {"error": str(exc), "type": exc.__class__.__name__},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    response.data["status_code"] = response.status_code
    response.data["error_type"] = exc.__class__.__name__
    return response
```

### Add to `settings/base.py`

```python
REST_FRAMEWORK = {
    "EXCEPTION_HANDLER": "apps.core.exceptions.custom_exception_handler",
}
```

---

## 🚀 Step 4 — Redis Caching for Agents

### `tasks/cache.py`

```python
from django.core.cache import cache
from .models import Agent

def get_cached_agents():
    """Cache agent list for 1 minute."""
    key = "agents:list"
    agents = cache.get(key)
    if agents is None:
        agents = list(Agent.objects.values("id", "name", "created_at"))
        cache.set(key, agents, timeout=60)
    return agents
```

### `agents/views.py`

```python
from rest_framework.views import APIView
from rest_framework.response import Response
from .cache import get_cached_agents

class AgentListCachedView(APIView):
    def get(self, request):
        agents = get_cached_agents()
        return Response(agents)
```

### Settings in `base.py`

```python
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.redis.RedisCache",
        "LOCATION": "redis://127.0.0.1:6379/1",
    }
}
```

---

## 🛡️ Step 5 — Security Hardening

### In `base.py`

```python
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # React dev
]
CSRF_TRUSTED_ORIGINS = ["http://localhost:5173"]

SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_SSL_REDIRECT = False  # enable in prod
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
```

Install:

```bash
pip install django-cors-headers
```

Add middleware:

```python
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    *MIDDLEWARE,
]
```

---

## 🧩 Step 6 — Frontend: Live Task Updates

### `src/hooks/useTaskStream.ts`

```typescript
import { useEffect, useState } from "react"

export function useTaskStream() {
  const [updates, setUpdates] = useState<any[]>([])

  useEffect(() => {
    const evtSource = new EventSource("http://localhost:8000/stream/tasks/")
    evtSource.onmessage = (e) => {
      const data = JSON.parse(e.data)
      setUpdates((prev) => {
        const existing = prev.filter((t) => t.id !== data.id)
        return [data, ...existing]
      })
    }
    return () => evtSource.close()
  }, [])

  return updates
}
```

### `src/components/TaskLiveList.tsx`

```tsx
import { useTaskStream } from "@/hooks/useTaskStream"

export function TaskLiveList() {
  const tasks = useTaskStream()

  return (
    <div className="space-y-2">
      {tasks.map((t) => (
        <div key={t.id} className="p-3 rounded-lg border bg-card">
          <div className="flex justify-between">
            <span>{t.id}</span>
            <span className="text-sm text-muted-foreground">{t.status}</span>
          </div>
          <pre className="text-xs mt-2">{t.output}</pre>
        </div>
      ))}
    </div>
  )
}
```

---

## ✅ **End of Day 4 Deliverables**

| Component             | Feature                              |
| --------------------- | ------------------------------------ |
| **Backend**           | SSE stream (`/stream/tasks/`)        |
| **Middleware**        | Logs user, IP, latency               |
| **Exception handler** | Unified JSON error responses         |
| **Caching**           | Redis cache for `/agents/`           |
| **Security**          | CORS, HTTPS headers, CSRF protection |
| **Frontend**          | Real-time task updates + live UI     |

---

## 🧠 Stretch Goals (Optional)

* Replace polling-based SSE with **Redis pub/sub**
* Add **rate-limit storage in Redis**
* Create **metrics dashboard** in React showing live success rate and throughput
