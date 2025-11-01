import { cn } from '@/lib/utils'
import { Link } from '@tanstack/react-router'
import { buttonVariants } from '@/components/ui/button'
import { Users, ClipboardList, Folder } from 'lucide-react'

export function Sidebar() {
  const links = [
    { to: '/dashboard/agents', label: 'Agents', icon: <Users className="h-4 w-4" /> },
    { to: '/dashboard/tasks', label: 'Tasks', icon: <ClipboardList className="h-4 w-4" /> },
    { to: '/dashboard/projects', label: 'Projects', icon: <Folder className="h-4 w-4" /> },
    { to: '/dashboard/users', label: 'Users', icon: <Users className="h-4 w-4" /> },
  ]

  return (
    <aside className="w-60 border-r border-slate-800/40 bg-slate-900/60 p-4 backdrop-blur">
      <nav className="flex flex-col gap-2">
        {links.map((link) => (
          <Link key={link.to} to={link.to} preload="intent">
            {({ isActive }: { isActive: boolean }) => (
              <div
                className={cn(
                  buttonVariants({ variant: 'ghost', size: 'sm' }),
                  'justify-start text-slate-300 hover:bg-indigo-500/10 hover:text-white transition-colors',
                  isActive && 'bg-indigo-500/20 text-white font-medium',
                )}
              >
                <span className="mr-2">{link.icon}</span>
                {link.label}
              </div>
            )}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
