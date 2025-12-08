"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="inline-flex items-center gap-2 text-sm  transition"
    >
      {theme === "light" ? (
        <>
          <Moon className="w-6 h-6" />
        </>
      ) : (
        <>
          <Sun className="w-6 h-6" />
        </>
      )}
    </button>
  );
}
