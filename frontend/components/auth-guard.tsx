"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    // Only run on client
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (!token || !user) {
      router.replace("/login");
      return;
    }

    try {
      const parsed = JSON.parse(user);
      if (!parsed?.email) {
        throw new Error("Invalid user");
      }
      setAllowed(true);
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.replace("/login");
    }
  }, [router]);

  if (!allowed) {
    return (
      <div className="w-full text-center text-slate-400 mt-10">
        Checking authentication...
      </div>
    );
  }

  return <>{children}</>;
}
