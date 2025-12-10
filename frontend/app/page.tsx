"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./providers/AuthProvider";
import LiquidLoader from "@/components/shared/LiquidLoader";

export default function HomePage() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoggedIn) {
      router.replace("/dashboard");
    } else {
      router.replace("/login");
    }
  }, [isLoggedIn, router]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
      <div className="mb-8">
         <h1 className='flex justify-center items-center flex-col'>
            <span className='font-bold text-6xl uppercase'>Hold 
                <span className='text-[#2b564e] dark:text-[#e44332]'>on</span>
            </span> 
            {isLoggedIn ? (
                <span className="uppercase">redirecting you to the dashboard</span>
              ) : (
                <span className="uppercase">redirecting you to the login page</span>
              )}
          </h1>
      </div>
      <LiquidLoader size="md" showText={true} speed={1.5} />
    </div>
  );
}
