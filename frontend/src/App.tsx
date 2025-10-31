
// import './App.css'



import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Sparkles, Brain, Rocket } from 'lucide-react'

export default function App() {
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
        <Button variant="secondary" className="bg-indigo-600 hover:bg-indigo-700 text-white">
          Join Beta
        </Button>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-5xl font-bold mb-4 tracking-tight">
            Build and Launch <span className="text-indigo-400">AI Agents</span> Faster
          </h2>
          <p className="text-lg text-slate-300 max-w-2xl mb-8">
            Agentarium is your all-in-one platform for designing, testing, and deploying intelligent AI agents.
            Built on Django + React + OpenAI.
          </p>
          <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white">
            Start Building
          </Button>
        </motion.div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 max-w-5xl">
          {[
            {
              icon: <Brain className="h-8 w-8 text-indigo-400" />,
              title: 'Intelligent by Design',
              desc: 'Leverage OpenAI-powered agents with Django backends and real-time reasoning.',
            },
            {
              icon: <Sparkles className="h-8 w-8 text-indigo-400" />,
              title: 'Beautifully Built',
              desc: 'Frontend built with Vite, TailwindCSS, and shadcn for pixel-perfect design.',
            },
            {
              icon: <Rocket className="h-8 w-8 text-indigo-400" />,
              title: 'Deploy Instantly',
              desc: 'From prototype to production-ready AI services with just one click.',
            },
          ].map((f, i) => (
            <motion.div
              key={i}
              className="flex flex-col items-center text-center p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
            >
              {f.icon}
              <h3 className="text-xl font-semibold mt-4 mb-2">{f.title}</h3>
              <p className="text-slate-400 text-sm max-w-xs">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-slate-500 border-t border-white/10">
        © 2025 Agentarium. Built with Django + React.
      </footer>
    </div>
  )
}
