import { Outlet } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { Toaster } from "@/components/ui/sonner";
import { Footer } from "@/components/Footer";

export function RootLayout() {
    return (
        <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
            <Navbar />
            <main className="flex-1">
                <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10">
                    <Outlet />
                </div>
                {import.meta.env.DEV && (
                    <TanStackRouterDevtools position="bottom-right" />
                )}
            </main>
            <Footer />
            <Toaster position="top-right" richColors closeButton />
        </div>
    );
}
