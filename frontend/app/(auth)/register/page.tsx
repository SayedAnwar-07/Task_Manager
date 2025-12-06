"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("John Doe");
  const [email, setEmail] = useState("john@example.com");
  const [password, setPassword] = useState("123456");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await apiFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });
      if (typeof window !== "undefined") {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data));
      }
      router.push("/tasks");
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <h1 className="mb-4 text-2xl font-semibold">Register</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="rounded-md border border-red-500 bg-red-950 px-3 py-2 text-sm text-red-100">
            {error}
          </p>
        )}
        <div className="space-y-1">
          <label className="text-sm text-slate-300">Name</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm text-slate-300">Email</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm text-slate-300">Password</label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••"
          />
        </div>
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Creating account..." : "Register"}
        </Button>
      </form>
    </div>
  );
}
