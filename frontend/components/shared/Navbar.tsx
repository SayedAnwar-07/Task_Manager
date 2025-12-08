"use client";

import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/app/providers/AuthProvider";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import SafeImage from "../SafeImage";
import { Menu, Home, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const { user, isLoggedIn, logout } = useAuth();

  // Safe fallback avatar
  const avatar = user?.display_image ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}`;

  return (
    <div className="flex items-center gap-4">
      {/* Desktop Links */}
      <div className="hidden md:flex items-center gap-3">
        {!isLoggedIn ? (
          <>
            <Link href="/login" className="text-sm bg-[#2b564e] text-white px-6 py-3">
              Login
            </Link>
            <Link href="/register" className="text-sm bg-[#2b564e] text-white px-6 py-3">
              Register
            </Link>
          </>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="cursor-pointer">
                <SafeImage
                  src={avatar}
                  alt={user?.name || "User"}
                  className="h-10 w-10 rounded-full border-2 border-[#2b564e]"
                />
              </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-56">
              <div className="p-3">
                <p className="font-medium">{user?.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {user?.email}
                </p>
              </div>

              <DropdownMenuSeparator />

              <DropdownMenuItem className="cursor-pointer">
                <Link href="/dashboard" className="flex items-center w-full">
                  <Home className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem className="cursor-pointer">
                <Link href="/profile" className="flex items-center w-full">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                className="cursor-pointer text-red-600 focus:text-red-600"
                onClick={logout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Mobile Sheet */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-10 w-10">
              {isLoggedIn && user ? (
                <SafeImage
                  src={avatar}
                  alt={user?.name || "User"}
                  className="w-10 h-10 rounded-full object-cover border-2 border-[#2b564e]"
                />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </SheetTrigger>

          <SheetContent side="right" className="w-[300px] sm:w-[350px] p-0">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-6 border-b">
                <div className="flex items-center gap-3">
                  {isLoggedIn && user ? (
                    <>
                      <SafeImage
                        src={avatar}
                        alt={user?.name || "User"}
                        className="w-12 h-12 rounded-full border-2 border-[#2b564e]"
                      />
                      <div>
                        <h3 className="font-semibold text-lg">{user?.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {user?.email}
                        </p>
                      </div>
                    </>
                  ) : (
                    <div>
                      <h3 className="font-semibold text-lg">Welcome</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Sign in to continue
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Navigation Menu */}
              <div className="flex-1 p-4">
                <nav className="space-y-2">
                  {isLoggedIn ? (
                    <Link href="/dashboard">
                      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <Home className="h-5 w-5" />
                        <span>Dashboard</span>
                      </div>
                    </Link>
                  ) : (
                    <Link href="/">
                      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <Home className="h-5 w-5" />
                        <span>Home</span>
                      </div>
                    </Link>
                  )}
                </nav>
              </div>

              {/* Footer */}
              <div className="p-4 border-t">
                {isLoggedIn ? (
                  <Button
                    onClick={logout}
                    variant="destructive"
                    className="w-full flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                ) : (
                  <div className="space-y-3 flex flex-col gap-2">
                    <Link href="/login">
                      <Button className="w-full bg-[#2b564e] hover:bg-[#2b564e]/90 text-white">
                        Sign In
                      </Button>
                    </Link>

                    <Link href="/register">
                      <Button
                        variant="outline"
                        className="w-full border-[#2b564e] text-[#2b564e] hover:bg-[#2b564e]/10"
                      >
                        Create Account
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
