import {
  createRouter,
  createRootRoute,
  createRoute,
} from '@tanstack/react-router'
import { RootLayout } from '@/layouts/RootLayout'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { Home } from '@/pages/Home'
import { Dashboard } from '@/pages/Dashboard'
import { AgentList as Agents } from '@/pages/agents'
import { TaskList as Tasks } from '@/pages/tasks'
import { Projects } from '@/pages/Projects'
import { Users } from './pages/users'

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


const tasksRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: 'tasks',
  component: Tasks,
})

const usersRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: 'users',
  component: Users,
})

const projectsRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: 'projects',
  component: Projects,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  dashboardRoute.addChildren([dashboardIndex, agentsRoute, projectsRoute, tasksRoute, usersRoute]),
])

export const router = createRouter({ routeTree })
