import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";

export function Navbar() {

    return (
        <header className="border-b border-white/5 bg-slate-950/80 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
                <motion.h1
                    className="text-2xl font-semibold tracking-tight md:text-3xl"
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                >
                    <Link to="/" className="hover:text-blue-500">
                        Agentarium
                        <span className="bg-linear-to-r from-indigo-400 to-sky-400 bg-clip-text text-transparent">
                            .
                        </span>
                    </Link>
                </motion.h1>

                <div className="flex items-center gap-4">
                    <Button className="hidden rounded-full bg-linear-to-r from-indigo-500 via-purple-500 to-sky-500 px-5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:from-indigo-400 hover:via-purple-400 hover:to-sky-400 hover:shadow-indigo-400/40 md:inline-flex">
                        Sign Up
                    </Button>

                    <Button className="hidden rounded-full bg-linear-to-r from-indigo-500 via-purple-500 to-sky-500 px-5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:from-indigo-400 hover:via-purple-400 hover:to-sky-400 hover:shadow-indigo-400/40 md:inline-flex">
                        Join Beta
                    </Button>
                </div>
            </div>
        </header>
    );
}
