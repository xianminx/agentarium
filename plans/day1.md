Perfect! Let’s set up **Day 1 scaffolding** for your **Agentarium** Django + DRF + React + Vite + TS project. I’ll make it structured so you can immediately start implementing features later. I’ll include backend, frontend, and some AI integration placeholders.

---

## **1️⃣ Project Folder Structure**

```
agentarium/
├── backend/
│   ├── manage.py
│   ├── agentarium/        # Django project settings
│   │   ├── __init__.py
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── apps/
│   │   ├── users/         # example app: users + auth
│   │   │   ├── models.py
│   │   │   ├── serializers.py
│   │   │   ├── views.py
│   │   │   └── urls.py
│   │   └── agents/        # main AI agents app
│   │       ├── models.py
│   │       ├── serializers.py
│   │       ├── views.py
│   │       └── urls.py
│   └── requirements.txt   # or pyproject.toml if using poetry
├── frontend/
│   ├── vite.config.ts
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   └── AgentDetail.tsx
│   │   └── components/
│   │       ├── ui/        # shadcn base components
│   │       └── molecules/ # custom components
└── .env
```

---

## **2️⃣ Backend Setup (Django + DRF)**

1. **Create Django project:**

```bash
uv venv && uv pip install django
source .venv/bin/activate && django-admin startproject agentarium backend/
uv add django djangorestframework
```

2. **Create apps:**

```bash
cd backend/
python manage.py startapp users apps/users
python manage.py startapp agents apps/agents
```

3. **Update `settings.py`:**

```python
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'apps/users',
    'apps/agents',
]
```

4. **Configure DRF and CORS** (allow frontend dev):

```bash
uv add django-cors-headers
```

```python
# settings.py
INSTALLED_APPS += ['corsheaders']
MIDDLEWARE = ['corsheaders.middleware.CorsMiddleware'] + MIDDLEWARE
CORS_ALLOW_ALL_ORIGINS = True
```

---

## **3️⃣ Frontend Setup (Vite + React + TS + Tailwind + Shadcn)**

1. **Create frontend:**

```bash
pnpm create vite@latest frontend -- --template react-ts
cd frontend
pnpm install
pnpm install tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

2. **Configure Tailwind in `tailwind.config.cjs`:**

```js
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: { extend: {} },
  plugins: [],
}
```

3. **Install shadcn/ui:**

```bash
pnpm install @shadcn/ui
```

* Place the components in `src/components/ui`
* Place custom components in `src/components/molecules`

4. **Set up basic pages**:

```tsx
// src/pages/Home.tsx
export default function Home() {
  return <div className="p-8">Welcome to Agentarium!</div>
}

// src/pages/AgentDetail.tsx
export default function AgentDetail() {
  return <div className="p-8">Agent Detail Page</div>
}
```

---

## **4️⃣ Backend API Scaffolding**

**Example `agents/models.py`:**

```python
from django.db import models

class Agent(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
```

**Example `agents/serializers.py`:**

```python
from rest_framework import serializers
from .models import Agent

class AgentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Agent
        fields = '__all__'
```

**Example `agents/views.py`:**

```python
from rest_framework import viewsets
from .models import Agent
from .serializers import AgentSerializer

class AgentViewSet(viewsets.ModelViewSet):
    queryset = Agent.objects.all()
    serializer_class = AgentSerializer
```

**Example `agents/urls.py`:**

```python
from rest_framework.routers import DefaultRouter
from .views import AgentViewSet

router = DefaultRouter()
router.register(r'agents', AgentViewSet)

urlpatterns = router.urls
```

**Connect in `backend/agentarium/urls.py`:**

```python
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('agents.urls')),
]
```

---

## **5️⃣ Optional: AI Integration Placeholder**

* Later we can create `/agents/ai.py` or an endpoint `/api/agents/:id/run` to call OpenAI API.
* For now, add a placeholder function:

```python
def run_agent(agent_id, input_text):
    # TODO: integrate OpenAI
    return f"Agent {agent_id} processed: {input_text}"
```

---

## ✅ **Day 1 Goals Completed**

1. Project structure created for backend + frontend.
2. Basic Django apps + DRF API ready.
3. Vite + React + TS + Tailwind + Shadcn setup.
4. Placeholder for AI integration.
5. Can run `python manage.py runserver` (backend) and `pnpm run dev` (frontend) and see basic pages.

