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
