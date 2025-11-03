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
import { Login } from '@/pages/Login'
import { Signup } from '@/pages/Signup'
import { Profile } from '@/pages/Profile'
import { Settings } from '@/pages/Settings'

const rootRoute = createRootRoute({
  component: RootLayout,
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Home,
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: Login,
})

const signupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/signup',
  component: Signup,
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

const profileRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: 'profile',
  component: Profile,
})

const settingsRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: 'settings',
  component: Settings,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  signupRoute,
  dashboardRoute.addChildren([
    dashboardIndex,
    agentsRoute,
    projectsRoute,
    tasksRoute,
    usersRoute,
    profileRoute,
    settingsRoute,
  ]),
])

export const router = createRouter({ routeTree })
