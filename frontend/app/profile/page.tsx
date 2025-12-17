"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/providers/AuthProvider";
import UpdateProfileForm from "@/components/profile/UpdateProfileForm";
import UpdatePasswordForm from "@/components/profile/UpdatePasswordForm";
import UpdateProfileImage from "@/components/profile/UpdateProfileImage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Key,  
  Trash2,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export default function ProfilePage() {
  const { user, token, isLoggedIn, loading, logout } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("profile");

  // 🔐 AUTH GUARD
  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.replace("/login");
    }
  }, [loading, isLoggedIn, router]);

  // 📡 Fetch profile data
  useEffect(() => {
    if (!user?._id || !token) return;

    const fetchProfile = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/users/${user._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await res.json();
        setProfile(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchProfile();
  }, [user, token]);

  // 🔄 Refresh profile data
  const refreshProfile = async () => {
    if (!user?._id || !token) return;
    try {
      const res = await fetch(
        `http://localhost:5000/api/users/${user._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      setProfile(data);
      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error(err);
    }
  };

  // 🗑️ Delete account function
  const handleDeleteAccount = async () => {
    if (!user?._id || !token) return;
    
    try {
      const res = await fetch(
        `http://localhost:5000/api/users/${user._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (res.ok) {
        toast.success("Account deleted successfully");
        logout();
        router.replace("/login");
      } else {
        const data = await res.json();
        toast.error("Failed to delete account:", data.message);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete account");
    }
  };

  // ⏳ Wait until auth resolves
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // 🚫 Not logged in (redirecting)
  if (!isLoggedIn) return null;

  // 📦 Fallback for profile data
  if (!profile) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const avatar =
    profile.display_image ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=3b82f6&color=fff&bold=true`;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <section className="py-8">
      <div className="max-w-5xl mx-auto sm:px-6 lg:px-8">
       

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Image Update Card */}
            <div className="">
              <div className="pt-6">
                <UpdateProfileImage 
                  userId={user!._id}
                  token={token}
                  currentImage={profile.display_image}
                  onUpdate={refreshProfile}
                />
              </div>
            </div>

            {/* About Card */}
            <div className="">
              <div className="pt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  About
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Full Name</p>
                    <p className="font-medium dark:text-white">{profile.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Email Address</p>
                    <p className="font-medium dark:text-white">{profile.email}</p>
                  </div>                
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Edit Forms */}
          <div className="lg:col-span-2 space-y-6">
            <div className="">
              <div className="pt-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="">
                  <TabsList className="grid w-full grid-cols-1 md:grid-cols-2 gap-2 my-4 bg-white dark:bg-[#101010] text-black dark:text-white">
                    <TabsTrigger value="profile" className="flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      Profile Settings
                    </TabsTrigger>
                    <TabsTrigger value="password" className="flex items-center">
                      <Key className="w-4 h-4 mr-2" />
                      Password & Security
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="profile" className="space-y-4 mt-6">
                    <UpdateProfileForm 
                      profile={profile} 
                      token={token}
                      onUpdate={refreshProfile}
                    />
                  </TabsContent>
                  
                  <TabsContent value="password" className="space-y-4 mt-6">
                    <UpdatePasswordForm 
                      userId={user!._id}
                      token={token}
                    />
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="w-full">
              <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="w-full">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Account
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your
                          account and remove all your data from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteAccount}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete Account
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}