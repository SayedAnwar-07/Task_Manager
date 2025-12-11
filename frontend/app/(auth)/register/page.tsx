"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayImage, setDisplayImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Preview image when user selects a file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setDisplayImage(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);
      if (displayImage) formData.append("display_image", displayImage);

      const data = await apiFetch("/api/auth/register", {
        method: "POST",
        body: formData, // send FormData to backend
      });

      if (typeof window !== "undefined") {
        localStorage.setItem("token", data.token);
        localStorage.setItem(
          "user",
          JSON.stringify({
            id: data._id,
            name: data.name,
            email: data.email,
            display_image: data.display_image || null,
          })
        );
      }

      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center mt-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-1">Create an account</h1>
          <p className="text-slate-600 dark:text-gray-300 text-sm">
            Sign up to get started with our platform
          </p>
        </div>

        <div className="border-slate-200 dark:border-slate-700 border dark:bg-[#101010] bg-white">
          <form onSubmit={handleSubmit} className="p-8">
            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-sm flex items-center">
                {error}
              </div>
            )}
            {/* Display Image */}
              {preview && (
                  <img
                    src={preview}
                    alt="Preview"
                    className="mt-2 w-20 h-20 object-cover rounded-full border border-slate-300"
                  />
                )}
              <div className="my-4">
                <label className="block text-xs font-medium uppercase tracking-wider mb-2">
                  Profile Picture
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="border border-slate-200 dark:border-slate-700 rounded-none px-3 py-2.5 text-sm w-full"
                />
                
              </div>

            <div className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="border border-slate-200 dark:border-slate-700 rounded-none px-3 py-2.5 text-sm bg-gray-50"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider mb-2">
                  Email address
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="border border-slate-200 dark:border-slate-700 rounded-none px-3 py-2.5 text-sm bg-gray-50"
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-medium uppercase tracking-wider">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password"
                    className="border border-slate-200 dark:border-slate-700 bg-gray-50 rounded-none placeholder-slate-400 focus:ring-none px-3 py-2.5 text-sm pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#2b564e] rounded-none hover:bg-slate-900 text-white py-3 font-medium text-sm uppercase tracking-wider transition-all duration-200 border-0"
              >
                {loading ? "Creating Account..." : "Sign Up"}
              </Button>
            </div>

            <div className="my-6 flex items-center">
              <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
              <span className="flex-shrink mx-4 text-slate-400 text-xs">OR</span>
              <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
            </div>

            <div className="text-center">
              <p className="text-sm">
                Already have an account?{" "}
                <Link href="/login" className="text-[#2b564e] hover:underline font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
