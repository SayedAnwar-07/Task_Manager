"use client";

import AuthGuard from "@/components/auth-guard";
import Tasks from "@/components/tasks/Tasks";

export default function DashboardPage() {

  return (
    <section>
      <AuthGuard>
        <div className="max-w-6xl mx-auto min-h-screen">
          <Tasks />
        </div>
      </AuthGuard>
    </section>
  );
}
