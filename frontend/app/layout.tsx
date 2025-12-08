import "./globals.css";
import { ReactNode } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import Link from "next/link";
import { AuthProvider } from "./providers/AuthProvider";import Navbar from "@/components/shared/Navbar";
import { Toaster } from "sonner";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata = {
  title: "Task Manager",
  description: "Team-based task manager",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/logo.png", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", type: "image/png" },
    ],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen">
        <AuthProvider>
          <ThemeProvider>
            <div className="flex min-h-screen flex-col">
              <header className="border-b">
                <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
                  <Link href="/" className="font-semibold flex gap-2 items-center">
                    <img src="https://i.ibb.co.com/ds9rs0YX/image-removebg-preview.png" alt="logo" className="w-10 h-10"/>
                    <div className="font-light text-sm">
                      <p className="font-semibold">Eentra <span className="dark:text-[#e44332] text-[#2b564e] font-bold">BD</span></p>
                      <p>Task Manager</p>
                    </div>
                  </Link>

                  {/* CLIENT COMPONENT CAN USE useAuth() */}
                  <div className="flex gap-3">
                    <ThemeToggle />
                    <Navbar />
                  </div>
                </div>
              </header>

              <main className="max-w-6xl mx-auto w-full px-4 py-6">
                {children}
                <Toaster />
              </main>
            </div>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
