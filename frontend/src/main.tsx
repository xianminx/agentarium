
import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { Outlet, RouterProvider, createRouter, createRoute, createRootRoute } from '@tanstack/react-router'
import AgentDetail from './pages/AgentDetail'
import App from './App'

const rootRoute = createRootRoute({
  component: Outlet,
})

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: App,
})

const agentDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/agent-detail',
  component: AgentDetail,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const router = createRouter({
  routeTree: rootRoute.addChildren([
    homeRoute,
    agentDetailRoute,
  ])
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)