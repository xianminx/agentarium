# 🗓️ **Day 3 Plan: Frontend → Backend Integration**

---

## 🌅 **Part 1: Frontend — App Structure, Navigation & State**

**Goal:**
Implement a modern React frontend using **TanStack Router v1**, **React Query**, **Tailwind**, and **Sonner Toaster**, with clean layouts and mock API data.

---

### 📁 Folder structure

```
frontend/
├─ src/
│  ├─ main.tsx
│  ├─ router.tsx
│  ├─ App.tsx
│  ├─ layouts/
│  │   ├─ RootLayout.tsx
│  │   └─ DashboardLayout.tsx
│  ├─ pages/
│  │   ├─ Home.tsx
│  │   ├─ Dashboard.tsx
│  │   ├─ Agents.tsx
│  │   └─ Projects.tsx
│  ├─ components/
│  │   ├─ Navbar.tsx
│  │   └─ Sidebar.tsx
│  ├─ lib/
│  │   ├─ api.ts
│  │   └─ queryClient.ts
│  └─ index.css
```

---

### ⚙️ Step 1 — `main.tsx`

```tsx
import { createRoot } from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { router } from './router'
import { queryClient } from './lib/queryClient'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <RouterProvider router={router} />
    <Toaster richColors />
  </QueryClientProvider>
)
```

---

### ⚙️ Step 2 — `lib/queryClient.ts`

```ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})
```

---

### ⚙️ Step 3 — `layouts/RootLayout.tsx`

```tsx
import { Outlet, Link } from '@tanstack/react-router'
import { Navbar } from '../components/Navbar'

export function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 p-4">
        <Outlet />
      </main>
      <footer className="text-center p-4 text-gray-400 text-sm">
        © {new Date().getFullYear()} Agentarium
      </footer>
    </div>
  )
}
```

---

### ⚙️ Step 4 — `layouts/DashboardLayout.tsx`

```tsx
import { Outlet } from '@tanstack/react-router'
import { Sidebar } from '../components/Sidebar'

export function DashboardLayout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 p-6">
        <Outlet />
      </div>
    </div>
  )
}
```

---

### ⚙️ Step 5 — `components/Navbar.tsx`

```tsx
import { Link } from '@tanstack/react-router'

export function Navbar() {
  return (
    <nav className="border-b border-gray-200 bg-white px-6 py-3 flex items-center justify-between">
      <h1 className="text-lg font-semibold text-gray-800">Agentarium</h1>
      <div className="flex gap-4">
        <Link to="/" className="hover:text-blue-600">Home</Link>
        <Link to="/dashboard" className="hover:text-blue-600">Dashboard</Link>
      </div>
    </nav>
  )
}
```

---

### ⚙️ Step 6 — `components/Sidebar.tsx`

```tsx
import { Link } from '@tanstack/react-router'

export function Sidebar() {
  return (
    <aside className="w-60 border-r border-gray-200 bg-gray-50 p-4">
      <nav className="flex flex-col gap-3">
        <Link to="/dashboard/agents" className="hover:text-blue-600">Agents</Link>
        <Link to="/dashboard/projects" className="hover:text-blue-600">Projects</Link>
      </nav>
    </aside>
  )
}
```

---

### ⚙️ Step 7 — Pages

#### `pages/Home.tsx`

```tsx
export function Home() {
  return (
    <div className="text-center mt-10">
      <h2 className="text-3xl font-bold">Welcome to Agentarium</h2>
      <p className="text-gray-500 mt-2">Your intelligent agent workspace.</p>
    </div>
  )
}
```

#### `pages/Dashboard.tsx`

```tsx
export function Dashboard() {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Dashboard Overview</h2>
      <p>Quick insights and recent activity.</p>
    </div>
  )
}
```

#### `pages/Agents.tsx`

```tsx
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'

export function Agents() {
  const { data, isLoading } = useQuery({
    queryKey: ['agents'],
    queryFn: () => api.get('/mock/agents').then(r => r.data),
  })

  if (isLoading) return <p>Loading agents...</p>

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Agents</h2>
      <ul className="space-y-2">
        {data.map((a: any) => (
          <li key={a.id} className="border rounded p-2">{a.name}</li>
        ))}
      </ul>
    </div>
  )
}
```

#### `pages/Projects.tsx`

```tsx
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'

export function Projects() {
  const { data, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.get('/mock/projects').then(r => r.data),
  })

  if (isLoading) return <p>Loading projects...</p>

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Projects</h2>
      <ul className="space-y-2">
        {data.map((p: any) => (
          <li key={p.id} className="border rounded p-2">{p.title}</li>
        ))}
      </ul>
    </div>
  )
}
```

---

### ⚙️ Step 8 — `lib/api.ts` (mock setup)

```ts
import axios from 'axios'

export const api = axios.create({
  baseURL: 'http://localhost:8000/api', // will point to Django later
})

// mock data fallback (for Part 1)
if (import.meta.env.DEV) {
  api.get = async (url: string) => {
    if (url.includes('agents')) {
      return { data: [{ id: 1, name: 'Agent Alpha' }, { id: 2, name: 'Agent Beta' }] }
    }
    if (url.includes('projects')) {
      return { data: [{ id: 1, title: 'Project X' }, { id: 2, title: 'Project Y' }] }
    }
    return { data: [] }
  }
}
```

---

### ⚙️ Step 9 — `router.tsx` (v1 syntax)

```tsx
import {
  createRouter,
  createRootRoute,
  createRoute,
  createRouteTree,
} from '@tanstack/react-router'
import { RootLayout } from './layouts/RootLayout'
import { DashboardLayout } from './layouts/DashboardLayout'
import { Home } from './pages/Home'
import { Dashboard } from './pages/Dashboard'
import { Agents } from './pages/Agents'
import { Projects } from './pages/Projects'

const rootRoute = createRootRoute({
  component: RootLayout,
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Home,
})

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: DashboardLayout,
})

const dashboardIndex = createRoute({
  getParentRoute: () => dashboardRoute,
  path: '/',
  component: Dashboard,
})

const agentsRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: 'agents',
  component: Agents,
})

const projectsRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: 'projects',
  component: Projects,
})

const routeTree = createRouteTree()
  .addChildren([rootRoute.addChildren([indexRoute, dashboardRoute.addChildren([
    dashboardIndex,
    agentsRoute,
    projectsRoute,
  ])])])

export const router = createRouter({ routeTree })
```

---

✅ **At this point:**

* You have a fully functional **React Router v1 app**.
* Mock API data loads through Axios.
* React Query manages caching.
* Sonner Toaster ready for notifications.

---

## 🌇 **Part 2: Backend — Django API Integration**

**Goal:** Replace mock data with real Django REST endpoints.

---

### 1️⃣ Backend structure recap

```
backend/
├─ config/
│  ├─ settings/
│  │   ├─ base.py
│  │   └─ dev.py
│  ├─ urls.py
│  └─ wsgi.py
├─ agentarium/
│  ├─ models.py
│  ├─ serializers.py
│  ├─ views.py
│  ├─ urls.py
│  └─ tests/
```

---

### 2️⃣ Create serializers

`agentarium/serializers.py`

```py
from rest_framework import serializers
from .models import Agent, Project

class AgentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Agent
        fields = ['id', 'name', 'description']

class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ['id', 'title', 'summary']
```

---

### 3️⃣ Create API views

`agentarium/views.py`

```py
from rest_framework import viewsets
from .models import Agent, Project
from .serializers import AgentSerializer, ProjectSerializer

class AgentViewSet(viewsets.ModelViewSet):
    queryset = Agent.objects.all()
    serializer_class = AgentSerializer

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
```

---

### 4️⃣ Register URLs

`agentarium/urls.py`

```py
from rest_framework.routers import DefaultRouter
from .views import AgentViewSet, ProjectViewSet

router = DefaultRouter()
router.register('agents', AgentViewSet)
router.register('projects', ProjectViewSet)

urlpatterns = router.urls
```

Then include it in `config/urls.py`:

```py
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('agentarium.urls')),
]
```

---

### 5️⃣ Enable CORS for frontend

`pip install django-cors-headers`
then in `config/settings/base.py`:

```py
INSTALLED_APPS += ["corsheaders"]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    *MIDDLEWARE,
]

CORS_ALLOW_ALL_ORIGINS = True  # or restrict to http://localhost:5173
```

---

### 6️⃣ Update frontend `lib/api.ts`

```ts
import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
})
```

---

### 7️⃣ Test Endpoints

Run:

```bash
python manage.py runserver
npm run dev
```

Open in browser:

* [http://localhost:5173/dashboard/agents](http://localhost:5173/dashboard/agents)
* [http://localhost:5173/dashboard/projects](http://localhost:5173/dashboard/projects)

✅ You should see real Django data.

---

## 🎯 **Summary**

| Stage                     | Goal                            | Status  |
| ------------------------- | ------------------------------- | ------- |
| Frontend Layouts + Router | Build UI with mock data         | ✅       |
| Backend Setup             | Build API for Agents & Projects | ✅       |
| Integration               | Axios + Query + CORS            | ✅       |
| Result                    | Full-stack, live data SPA       | 🚀 Done |
