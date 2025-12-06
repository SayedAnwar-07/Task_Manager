"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="inline-flex items-center gap-2 rounded-md border border-slate-700 px-3 py-1 text-sm hover:bg-slate-800 transition"
    >
      {theme === "light" ? (
        <>
          <Moon className="w-4 h-4" />
          <span>Dark</span>
        </>
      ) : (
        <>
          <Sun className="w-4 h-4" />
          <span>Light</span>
        </>
      )}
    </button>
  );
}
