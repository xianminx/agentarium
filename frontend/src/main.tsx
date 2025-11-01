import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import React from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from 'sonner';
import "./index.css";
import { router } from "./router";

import { queryClient } from "@/lib/queryClient";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
            <Toaster richColors />
        </QueryClientProvider>
    </React.StrictMode>
);
