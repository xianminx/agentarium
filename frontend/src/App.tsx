import { motion } from "framer-motion";
import { Button, buttonVariants } from "@/components/ui/button";
import { Outlet, Link } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner"; // ✅ import Toaster
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { cn } from "@/lib/utils";

export function App() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <header className="border-b border-white/5 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <motion.h1
            className="text-2xl font-semibold tracking-tight md:text-3xl"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            Agentarium<span className="bg-gradient-to-r from-indigo-400 to-sky-400 bg-clip-text text-transparent">.</span>
          </motion.h1>

          <nav className="hidden items-center gap-2 text-sm font-medium md:flex">
            <Link
              to="/"
              prefetch="intent"
              className={({ isActive }) =>
                cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "text-slate-300 hover:bg-indigo-500/10 hover:text-white",
                  isActive && "bg-indigo-500/20 text-white"
                )
              }
            >
              Home
            </Link>
            <Link
              to="/agents"
              prefetch="intent"
              className={({ isActive }) =>
                cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "text-slate-300 hover:bg-indigo-500/10 hover:text-white",
                  isActive && "bg-indigo-500/20 text-white"
                )
              }
            >
              Agents
            </Link>
            <Link
              to="/tasks"
              prefetch="intent"
              className={({ isActive }) =>
                cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "text-slate-300 hover:bg-indigo-500/10 hover:text-white",
                  isActive && "bg-indigo-500/20 text-white"
                )
              }
            >
              Tasks
            </Link>
          </nav>

          <Button className="hidden rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-sky-500 px-5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:from-indigo-400 hover:via-purple-400 hover:to-sky-400 hover:shadow-indigo-400/40 md:inline-flex">
            Join Beta
          </Button>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10">
          <Outlet />
        </div>
        {import.meta.env.DEV && <TanStackRouterDevtools position="bottom-right" />}
      </main>

      <footer className="border-t border-white/5 bg-slate-950/80 py-6 text-center text-sm text-slate-500">
        © 2025 Agentarium. Built with Django + React.
      </footer>

      <Toaster position="top-right" richColors closeButton />
    </div>
  );
}
