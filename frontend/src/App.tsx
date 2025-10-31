import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Outlet, Link } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner"; // ✅ import Toaster
import { TanStackRouterDevtools } from "@tanstack/router-devtools";

export function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-white flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center px-8 py-6 border-b border-white/10">
        <motion.h1
          className="text-2xl font-bold tracking-tight"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Agentarium<span className="text-indigo-400">.</span>
        </motion.h1>

  <nav className="flex gap-4">
          <Link to="/">
            <Button variant="outline">Home</Button>
          </Link>
          <Link to="/agents">
            <Button variant="outline">Agents</Button>
          </Link>
          <Link to="/tasks">
            <Button variant="outline">Tasks</Button>
          </Link>
        </nav>

        <Button
          variant="secondary"
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          Join Beta
        </Button>
      </header>

          {/* Routed pages */}
      <main className="flex-1 p-6">
        <Outlet />
              {import.meta.env.DEV && <TanStackRouterDevtools position="bottom-right" />}

      </main>


      {/* Footer */}
      <footer className="text-center py-6 text-slate-500 border-t border-white/10">
        © 2025 Agentarium. Built with Django + React.
      </footer>

      {/* ✅ Global Toaster */}
      <Toaster position="top-right" richColors closeButton />
    </div>
  );
}
