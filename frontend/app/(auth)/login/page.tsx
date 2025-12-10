"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";


export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  console.log(process.env.NEXT_PUBLIC_API_BASE)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user");

      if (token && user) {
        try {
          const parsed = JSON.parse(user);
          if (parsed && parsed.email) {
            router.push("/dashboard");
          }
        } catch (e) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      }
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (typeof window !== "undefined") {
        localStorage.setItem("token", data.token);
        localStorage.setItem(
          "user",
          JSON.stringify({
            _id: data._id ?? data.id,
            name: data.name,
            email: data.email,
            display_image: data.display_image || null,
          })
        );

        window.location.href = "/dashboard";
      }
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center mt-20 md:mt-40 ">
      <div className="w-full max-w-md">
        {/* Header Section */}
        <div className="text-center mb-8">
          
          <h1 className="text-3xl font-bold  tracking-tight mb-1">Welcome back</h1>
          <p className="text-slate-600 dark:text-gray-300 text-sm">Sign in to your account to continue</p>
        </div>

        {/* Form Card */}
        <div className="border-slate-200 dark:border-slate-700 border bg-white dark:bg-[#101010]">
          <form onSubmit={handleSubmit} className="p-8">
            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-sm flex items-center">
                <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-medium  uppercase tracking-wider mb-2">
                  Email address
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="border border-slate-200 dark:border-slate-700 bg-gray-50 rounded-none placeholder-slate-400 focus:ring-none px-3 py-2.5 text-sm"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-medium  uppercase tracking-wider">
                    Password
                  </label>
                  
                </div>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="border border-slate-200 dark:border-slate-700 bg-gray-50 rounded-none placeholder-slate-400 focus:ring-none px-3 py-2.5 text-sm pr-10"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500"
                  >
                     {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#2b564e] rounded-none hover:bg-slate-900 text-white py-3 font-medium text-sm uppercase tracking-wider transition-all duration-200 border-0"
                style={{ backgroundColor: "#2b564e" }}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-4 w-4 mr-2 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Authenticating...
                  </span>
                ) : (
                  "Sign In"
                )}
              </Button>
            </div>

            {/* Divider */}
            <div className="my-6 flex items-center">
              <div className="flex-grow border-tborder-slate-200 dark:border-slate-700"></div>
              <span className="flex-shrink mx-4 text-slate-400 text-xs">OR</span>
              <div className="flex-grow border-tborder-slate-200 dark:border-slate-700"></div>
            </div>

            {/* Register Link */}
            <div className="text-center">
              <p className="text-sm ">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="text-[#2b564e] hover rounded-none font-medium transitior-transparennone"
                >
                  Create account
                </Link>
              </p>
            </div>
          </form>
        </div>

       
      </div>
    </div>
  );
}