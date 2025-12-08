"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./providers/AuthProvider";

export default function HomePage() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoggedIn) {
      // Redirect to dashboard if logged in
      router.replace("/dashboard");
    } else {
      // Redirect to login if not logged in
      router.replace("/login");
    }
  }, [isLoggedIn, router]);

  // Optional: Show loading while redirecting
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-3xl font-semibold">Redirecting...</h1>
    </div>
  );
}
