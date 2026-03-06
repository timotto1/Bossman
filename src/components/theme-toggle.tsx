"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";

export function ThemeToggle() {
    const { theme, setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Avoid hydration mismatch
    useEffect(() => setMounted(true), []);
    if (!mounted) return <div className="h-8 w-14 rounded-full" />;

    const isDark = resolvedTheme === "dark";

    return (
        <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-white/60 hover:bg-white/10 hover:text-white transition-colors text-sm font-medium"
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
            <div className="relative flex-shrink-0">
                {/* Track */}
                <div
                    className={[
                        "w-9 h-5 rounded-full transition-colors duration-300",
                        isDark ? "bg-purple-500" : "bg-white/20",
                    ].join(" ")}
                />
                {/* Thumb */}
                <div
                    className={[
                        "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-300 flex items-center justify-center",
                        isDark ? "translate-x-4" : "translate-x-0.5",
                    ].join(" ")}
                >
                    {isDark ? (
                        <MoonIcon className="w-2.5 h-2.5 text-purple-600" />
                    ) : (
                        <SunIcon className="w-2.5 h-2.5 text-yellow-500" />
                    )}
                </div>
            </div>
            <span>{isDark ? "Dark mode" : "Light mode"}</span>
        </button>
    );
}
