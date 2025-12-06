"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch, getAuthToken } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface WorkImage {
  url: string;
  publicId: string;
  _id: string;
}

interface Work {
  _id: string;
  title: string;
  description?: string;
  timeRange?: string;
  images: WorkImage[];
  createdBy?: { _id: string; name: string; email: string };
}

interface Task {
  _id: string;
  title: string;
  description?: string;
  status: "todo" | "in_progress" | "done";
  startDate?: string;
  deadline?: string;
}

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params?.id as string;

  const [task, setTask] = useState<Task | null>(null);
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);

  const [workTitle, setWorkTitle] = useState("");
  const [workDescription, setWorkDescription] = useState("");
  const [timeRange, setTimeRange] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [creatingWork, setCreatingWork] = useState(false);

  useEffect(() => {
    if (!getAuthToken()) {
      router.push("/login");
      return;
    }
    if (taskId) {
      loadTask();
      loadWorks();
    }
  }, [router, taskId]);

  const loadTask = async () => {
    try {
      const data = await apiFetch(`/api/tasks/${taskId}`);
      setTask(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadWorks = async () => {
    try {
      const data = await apiFetch(`/api/tasks/${taskId}/works`);
      setWorks(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workTitle.trim()) return;
    setCreatingWork(true);
    try {
      const formData = new FormData();
      formData.append("title", workTitle);
      if (workDescription) formData.append("description", workDescription);
      if (timeRange) formData.append("timeRange", timeRange);
      if (files && files.length > 0) {
        Array.from(files).forEach((file) =>
          formData.append("images", file, file.name)
        );
      }

      await apiFetch(`/api/tasks/${taskId}/works`, {
        method: "POST",
        body: formData,
      });

      setWorkTitle("");
      setWorkDescription("");
      setTimeRange("");
      setFiles(null);
      await loadWorks();
    } catch (err) {
      console.error(err);
    } finally {
      setCreatingWork(false);
    }
  };

  const statusLabel = (status: Task["status"]) => {
    switch (status) {
      case "todo":
        return "Todo";
      case "in_progress":
        return "In Progress";
      case "done":
        return "Done";
    }
  };

  if (loading && !task) {
    return <p className="text-slate-400 text-sm">Loading task...</p>;
  }

  if (!task) {
    return <p className="text-slate-400 text-sm">Task not found.</p>;
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">{task.title}</h1>
        {task.description && (
          <p className="mt-2 text-sm text-slate-300">{task.description}</p>
        )}
        <p className="mt-2 text-xs text-slate-500">
          Status:{" "}
          <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs">
            {statusLabel(task.status)}
          </span>
        </p>
      </div>

      {/* Create work */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <h2 className="mb-3 text-sm font-medium text-slate-200">
          Add work for this task
        </h2>
        <form onSubmit={handleCreateWork} className="space-y-3">
          <Input
            placeholder="Work title"
            value={workTitle}
            onChange={(e) => setWorkTitle(e.target.value)}
          />
          <Textarea
            placeholder="Description (optional)"
            value={workDescription}
            onChange={(e) => setWorkDescription(e.target.value)}
          />
          <Input
            placeholder="Time range (e.g. 10am-2pm)"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          />
          <div className="space-y-1">
            <label className="text-xs text-slate-400">
              Upload images (optional)
            </label>
            <input
              type="file"
              multiple
              onChange={(e) => setFiles(e.target.files)}
              className="block w-full text-sm text-slate-300 file:mr-3 file:rounded-md file:border-0 file:bg-slate-800 file:px-3 file:py-1 file:text-sm file:text-slate-100 hover:file:bg-slate-700"
            />
          </div>
          <Button type="submit" disabled={creatingWork || !workTitle.trim()}>
            {creatingWork ? "Adding work..." : "Add work"}
          </Button>
        </form>
      </div>

      {/* Works list */}
      <div className="space-y-3">
        <h2 className="text-sm font-medium text-slate-200">Works</h2>
        {works.length === 0 ? (
          <p className="text-sm text-slate-400">
            No work entries yet. Add one above.
          </p>
        ) : (
          works.map((work) => (
            <div
              key={work._id}
              className="rounded-xl border border-slate-800 bg-slate-900/60 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-slate-100">
                    {work.title}
                  </h3>
                  {work.timeRange && (
                    <p className="mt-1 text-xs text-sky-300">
                      Time: {work.timeRange}
                    </p>
                  )}
                  {work.description && (
                    <p className="mt-2 text-sm text-slate-300">
                      {work.description}
                    </p>
                  )}
                  {work.createdBy && (
                    <p className="mt-2 text-xs text-slate-500">
                      By: {work.createdBy.name} ({work.createdBy.email})
                    </p>
                  )}
                </div>
              </div>

              {work.images && work.images.length > 0 && (
                <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3">
                  {work.images.map((img) => (
                    <a
                      key={img._id}
                      href={img.url}
                      target="_blank"
                      rel="noreferrer"
                      className="block overflow-hidden rounded-lg border border-slate-800 bg-slate-950/80"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.url}
                        alt="Work image"
                        className="h-32 w-full object-cover hover:scale-105 transition-transform"
                      />
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
