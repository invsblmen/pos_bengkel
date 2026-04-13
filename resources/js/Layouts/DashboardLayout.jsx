import React, { useEffect, useMemo, useRef, useState } from "react";
import { router, usePage } from "@inertiajs/react";
import Sidebar from "@/Components/Dashboard/Sidebar";
import Navbar from "@/Components/Dashboard/Navbar";
import { Toaster } from "react-hot-toast";
import { useTheme } from "@/Context/ThemeSwitcherContext";
import { useGoRealtime } from "@/Hooks/useGoRealtime";

export default function AppLayout({ children }) {
    const { darkMode, themeSwitcher } = useTheme();
    const { url } = usePage();
    const reloadTimerRef = useRef(null);

    const [sidebarOpen, setSidebarOpen] = useState(
        localStorage.getItem("sidebarOpen") === "true"
    );

    useEffect(() => {
        localStorage.setItem("sidebarOpen", sidebarOpen);
    }, [sidebarOpen]);

    const shouldEnableGlobalRealtime = useMemo(() => {
        if (!url?.startsWith("/dashboard")) return false;

        // Keep print pages stable during printing.
        return !/\/print$/.test(url);
    }, [url]);

    useGoRealtime({
        enabled: shouldEnableGlobalRealtime,
        domains: [
            "customers",
            "vehicles",
            "suppliers",
            "mechanics",
            "services",
            "service_categories",
            "part_categories",
            "parts",
            "vouchers",
            "service_orders",
            "appointments",
            "part_purchases",
            "part_purchase_orders",
            "part_sales",
            "part_sales_orders",
        ],
        onEvent: () => {
            if (reloadTimerRef.current) {
                clearTimeout(reloadTimerRef.current);
            }

            reloadTimerRef.current = setTimeout(() => {
                router.reload({
                    preserveScroll: true,
                    preserveState: true,
                });
            }, 700);
        },
    });

    useEffect(() => {
        return () => {
            if (reloadTimerRef.current) {
                clearTimeout(reloadTimerRef.current);
            }
        };
    }, []);

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    return (
        <div className="h-screen overflow-hidden flex bg-slate-100 dark:bg-slate-950 transition-colors duration-200">
            <Sidebar sidebarOpen={sidebarOpen} />
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <Navbar
                    toggleSidebar={toggleSidebar}
                    themeSwitcher={themeSwitcher}
                    darkMode={darkMode}
                />
                <main className="flex-1 overflow-y-auto">
                    <div className="w-full py-6 px-4 md:px-6 lg:px-8 pb-20 md:pb-6">
                        <Toaster
                            position="top-right"
                            toastOptions={{
                                className: "text-sm",
                                duration: 3000,
                                style: {
                                    background: darkMode ? "#1e293b" : "#fff",
                                    color: darkMode ? "#f1f5f9" : "#1e293b",
                                    border: `1px solid ${
                                        darkMode ? "#334155" : "#e2e8f0"
                                    }`,
                                    borderRadius: "12px",
                                },
                            }}
                        />
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
