import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-3xl font-semibold">Welcome to Task Manager</h1>
      <p className="text-slate-400 max-w-md">
        Collaborate with your team, create tasks, and log work with time ranges and images.
      </p>
      <div className="flex gap-3 mt-4">
        <Link
          href="/login"
          className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium hover:bg-sky-700"
        >
          Login
        </Link>
        <Link
          href="/register"
          className="rounded-md border border-slate-700 px-4 py-2 text-sm font-medium hover:bg-slate-900"
        >
          Register
        </Link>
      </div>
    </div>
  );
}
