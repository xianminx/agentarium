import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Settings, LogOut } from "lucide-react";

export function Navbar() {
    const { user, isAuthenticated, logout } = useAuth();

    const getInitials = (username: string) => {
        return username.substring(0, 2).toUpperCase();
    };

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
                    {isAuthenticated && user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="relative h-10 w-10 rounded-full"
                                >
                                    <Avatar className="h-10 w-10 border-2 border-indigo-500/30">
                                        <AvatarFallback className="bg-gradient-to-r from-indigo-500 via-purple-500 to-sky-500 text-white font-semibold">
                                            {getInitials(user.username)}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-56 bg-slate-900 border-white/10 text-slate-100"
                                align="end"
                            >
                                <DropdownMenuLabel className="text-slate-100">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium text-slate-100">{user.username}</p>
                                        <p className="text-xs text-slate-400">{user.email}</p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-white/10" />
                                <DropdownMenuItem asChild>
                                    <Link
                                        to="/dashboard/profile"
                                        className="flex cursor-pointer items-center text-slate-100 hover:text-white hover:bg-slate-800 focus:text-white focus:bg-slate-800"
                                    >
                                        <User className="mr-2 h-4 w-4" />
                                        <span>Profile</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link
                                        to="/dashboard/settings"
                                        className="flex cursor-pointer items-center text-slate-100 hover:text-white hover:bg-slate-800 focus:text-white focus:bg-slate-800"
                                    >
                                        <Settings className="mr-2 h-4 w-4" />
                                        <span>Settings</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-white/10" />
                                <DropdownMenuItem
                                    onClick={() => logout()}
                                    className="cursor-pointer text-red-400 hover:text-red-300 hover:bg-slate-800 focus:text-red-300 focus:bg-slate-800"
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Logout</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <>
                            <Link to="/login">
                                <Button
                                    variant="ghost"
                                    className="text-sm font-semibold hover:text-indigo-400"
                                >
                                    Login
                                </Button>
                            </Link>
                            <Link to="/signup">
                                <Button className="rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-sky-500 px-5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:from-indigo-400 hover:via-purple-400 hover:to-sky-400 hover:shadow-indigo-400/40">
                                    Sign Up
                                </Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
