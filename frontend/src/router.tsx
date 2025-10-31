// src/router.tsx
import { createRouter, createRootRoute, createRoute } from '@tanstack/react-router'
import { App } from './App'
import { AgentList } from './components/AgentList'
import { TaskList } from './components/TaskList'
import { Home } from './pages/Home'

// Root layout
const rootRoute = createRootRoute({
  component: App,
})

// Child routes
const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => <Home />,
})

const agentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/agents',
  component: AgentList,
})

const tasksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tasks',
  component: TaskList,
})

// Route tree
const routeTree = rootRoute.addChildren([homeRoute, agentsRoute, tasksRoute])

// Export router
export const router = createRouter({ routeTree })
