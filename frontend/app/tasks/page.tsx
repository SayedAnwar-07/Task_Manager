"use client";

import AuthGuard from "@/components/auth-guard";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { Plus, RefreshCw } from "lucide-react";

interface Task {
  _id: string;
  title: string;
  description?: string;
  status: "pending" | "in_progress" | "done";
  startDate?: string;
  deadline?: string;
}

export default function TasksPage() {
  return (
    <AuthGuard>
      <TasksContent />
    </AuthGuard>
  );
}

function TasksContent() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const loadTasks = async () => {
    setLoading(true);
    try {
      const data = await apiFetch("/api/tasks");
      setTasks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks(); // only run AFTER user is allowed
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setCreating(true);
    try {
      await apiFetch("/api/tasks", {
        method: "POST",
        body: JSON.stringify({
          title,
          description,
          status: "pending",
        }),
      });
      setTitle("");
      setDescription("");
      await loadTasks();
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const statusBadge = (status: Task["status"]) => {
    const map: Record<Task["status"], string> = {
      pending: "bg-slate-800 text-slate-200",
      in_progress: "bg-amber-500/20 text-amber-300",
      done: "bg-emerald-500/20 text-emerald-300",
    };
    return (
      <span
        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${map[status]}`}
      >
        {status.replace("_", " ")}
      </span>
    );
  };

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">Tasks</h1>
        <Button variant="outline" size="sm" onClick={loadTasks} disabled={loading}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* CREATE TASK */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-200">
          <Plus className="h-4 w-4" />
          Create new task
        </h2>
        <form onSubmit={handleCreate} className="space-y-3">
          <Input
            placeholder="Task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Textarea
            placeholder="Short description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Button type="submit" disabled={creating || !title.trim()}>
            {creating ? "Creating..." : "Create Task"}
          </Button>
        </form>
      </div>

      {/* TASK LIST */}
      <div className="space-y-3">
        {loading ? (
          <p className="text-slate-400 text-sm">Loading tasks...</p>
        ) : tasks.length === 0 ? (
          <p className="text-slate-400 text-sm">No tasks yet. Create one above.</p>
        ) : (
          tasks.map((task) => (
            <Link
              key={task._id}
              href={`/tasks/${task._id}`}
              className="block rounded-xl border border-slate-800 bg-slate-900/60 p-4 hover:border-sky-500/60 hover:bg-slate-900 transition"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-slate-100">
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className="mt-1 text-sm text-slate-400 line-clamp-2">
                      {task.description}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1">
                  {statusBadge(task.status)}
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
