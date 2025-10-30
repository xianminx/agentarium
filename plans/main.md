# Plan for Agentarium

This is a **5-day “Django + DRF Advanced Intensive” bootcamp**, still focused on the **Agent Workflow Dashboard** project, but packing in the *deep professional-grade Django and DRF topics* instead of stretching them to 10 days.

That means each day combines **hands-on project progress + advanced conceptual learning**, so by Day 5 you’ve both *built a working system* and *learned the internals and scaling practices* behind it.

---

## ⚙️ Overview

**Project:** *Agent Workflow Dashboard*
**Frontend:** React (Vite + TS + Tailwind + shadcn)
**Backend:** Django + DRF + Celery + Redis + OpenAI API
**Goal:** Build and deploy an async AI-agent orchestration app while mastering Django’s professional-grade topics in 5 very full days.

---

## 🗓️ 5-Day Advanced & Intensive Schedule

---

### **Day 1 – Architecture, ORM Mastery, and API Foundations**

**Concepts**

* Modular Django settings (`base/dev/prod`)
* Custom user model & auth backend
* Advanced ORM: QuerySets, Managers, `Q`, `F`, `annotate`, `select_related`
* DRF architecture: ViewSets, Routers, Serializers deep dive
* API versioning & schema intro (OpenAPI)

**Project Work**

* Scaffold project `agent_dashboard/`
* Apps: `users`, `agents`, `tasks`
* Build base models with custom manager for filtering tasks by status
* Create DRF serializers & routers
* Setup JWT auth with `djangorestframework-simplejwt`
* Add first endpoints `/agents/` and `/tasks/`

**Frontend**

* Bootstrap React + Vite + TS + Tailwind + shadcn
* Layout (Sidebar + Header + Table view)
* Axios + React Query client setup with JWT auth
* Call `/agents/` & `/tasks/` endpoints

---

### **Day 2 – API Design Depth, Permissions, and Query Efficiency**

**Concepts**

* Serializer composition (nested, writable, custom fields)
* Object-level permissions and DRF custom permission classes
* Filtering & pagination with `django-filter`
* Throttling, rate limits
* ORM optimization: `prefetch_related`, `only`, `defer`
* Testing APIs with `APIClient`

**Project Work**

* Build `/tasks/run/` custom action (POST)
* Add filters (`status`, `agent`, `date_range`)
* Implement custom permission: *only owner can edit tasks*
* Apply throttling by user token
* Optimize query usage in views
* Write first DRF test cases (pytest)

**Frontend**

* Implement Agent CRUD UI (modal + table)
* Add filter/sort for task list
* Toast feedback (shadcn `use-toast`)

---

### **Day 3 – Async Execution, Celery, and OpenAI Integration**

**Concepts**

* Celery + Redis setup and monitoring
* Async ORM patterns and task chaining
* Handling external APIs safely (retries, timeouts)
* Signals vs Celery for background logic
* Caching basics (Redis view caching)

**Project Work**

* Implement Celery worker
* Add `run_agent_task` async job calling OpenAI Chat API
* Store outputs + status updates
* Cache common queries (e.g., recent tasks)
* Add post-save signal to trigger Celery job when task created
* Integrate structured logging

**Frontend**

* “Run Task” button → triggers `/tasks/run/`
* Poll task status every few seconds (React Query refetch)
* Task detail modal showing output + metadata

---

### **Day 4 – Real-Time Updates, Middleware, and Security**

**Concepts**

* Django Channels or Server-Sent Events for live task updates
* Custom middleware for request tracing
* Exception handling & DRF error responses
* Security hardening: CSRF, CORS, HTTPS, headers
* Rate-limit storage in Redis
* Caching policies (per-view vs low-level)

**Project Work**

* Add SSE endpoint `/stream/tasks/` sending status updates
* Build middleware logging IP, user, latency
* Implement custom DRF exception handler
* Add Redis caching for agent list
* Enable CORS securely for React client

**Frontend**

* Real-time live-update bar for task progress
* Toast notifications on completion/errors
* Agent summary cards (avg time, success rate)

---

### **Day 5 – Testing, CI/CD, and Deployment**

**Concepts**

* Django test framework + pytest best practices
* Mocking OpenAI API in tests
* Coverage measurement
* Dockerizing Django + Celery + Redis + React
* Production settings (Gunicorn, env vars, logging)
* API docs (Swagger / ReDoc via `drf-spectacular`)

**Project Work**

* Add full test suite (models, serializers, views)
* Build Docker Compose with services:
  `web`, `celery`, `redis`, `frontend`
* Generate API schema docs
* Add management command for cleanup
* Optional deploy (Render/Fly.io/DigitalOcean)

**Frontend**

* Final polish: responsive layout, dark mode
* Dashboard metrics cards
* Build & serve React from Django’s `/static/` for Docker demo
* Demo: run full workflow end-to-end

---

## 🧩 Deliverables by Day 5

✅ Full-stack AI Agent Dashboard
✅ Celery-powered async task system
✅ Advanced Django & DRF patterns (ORM, permissions, caching, signals, middleware)
✅ Real-time updates (SSE/Channels)
✅ Secure, tested, and dockerized deployment-ready build

