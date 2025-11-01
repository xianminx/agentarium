import { Outlet, Link } from '@tanstack/react-router'
import { Navbar } from '@/components/Navbar'

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
