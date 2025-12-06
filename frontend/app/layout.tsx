import "./globals.css";
import type { ReactNode } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";

export const metadata = {
  title: "Task Manager",
  description: "Team-based task manager",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-950 text-slate-100">
        <ThemeProvider>
          <div className="flex min-h-screen flex-col">
            <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
              <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
                <Link href="/tasks" className="font-semibold text-sky-400">
                  Task Manager
                </Link>
                <div className="flex items-center gap-3">
                  <Link
                    href="/tasks"
                    className="text-sm text-slate-300 hover:text-white"
                  >
                    Tasks
                  </Link>
                  <Link
                    href="/login"
                    className="text-sm text-slate-300 hover:text-white"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="text-sm text-slate-300 hover:text-white"
                  >
                    Register
                  </Link>
                  <ThemeToggle />
                </div>
              </div>
            </header>
            <main className="mx-auto flex w-full max-w-5xl flex-1 px-4 py-6">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
