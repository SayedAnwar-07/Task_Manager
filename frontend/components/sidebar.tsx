"use client";

import Link from "next/link";
import { ThemeToggle } from "./theme-provider";

export default function Sidebar() {
  return (
    <div className="w-64 h-screen border-r p-4 flex flex-col justify-between">
      <nav className="space-y-3">
        <Link href="/dashboard" className="block">Dashboard</Link>
        <Link href="/tasks" className="block">Tasks</Link>
      </nav>

      <ThemeToggle />
    </div>
  );
}
