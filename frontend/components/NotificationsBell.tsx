"use client";

import { useEffect, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";

import { useAuth } from "@/app/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

type NotificationType = "task" | "work";

interface Notification {
  _id: string;
  message: string;
  type: NotificationType;
  readBy: string[];
  link?: string;
  createdAt: string;
}

export function NotificationsBell() {
  const { token, user } = useAuth();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isRead = (n: Notification) => {
    if (!user) return false;
    return n.readBy?.includes(user._id);
  };

  const isReminder = (n: Notification) =>
    n.message.toLowerCase().includes("reminder");

  // 🔔 Count unread notifications
  const unreadCount = notifications.filter((n) => !isRead(n)).length;

  // 📡 Fetch notifications
  const fetchNotifications = async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/notifications`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to load notifications");

      const data: Notification[] = await res.json();
      setNotifications(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Mark notification as read
  const markAsRead = async (id: string) => {
    if (!token) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/notifications/${id}/read`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) return;

      const updated: Notification = await res.json();

      setNotifications((prev) =>
        prev.map((n) => (n._id === updated._id ? updated : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  // 🔁 Initial fetch + auto refresh every 1 minute
  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(fetchNotifications, 60 * 1000);
    return () => clearInterval(interval);
  }, [token]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />

          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-semibold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-80" align="end">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          <Button
            onClick={fetchNotifications}
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
          >
            Refresh
          </Button>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Loading */}
        {loading && (
          <div className="p-4 text-sm text-muted-foreground">
            Loading notifications...
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-4 text-sm text-red-500">{error}</div>
        )}

        {/* Empty */}
        {!loading && !error && notifications.length === 0 && (
          <div className="p-4 text-sm text-muted-foreground">
            No notifications yet.
          </div>
        )}

        {/* Notifications */}
        {!loading && !error && notifications.length > 0 && (
          <ScrollArea className="max-h-80">
            <div className="space-y-1 p-1">
              {notifications.map((n) => (
                <DropdownMenuItem
                  key={n._id}
                  className="flex items-start gap-2 px-2 py-2 cursor-pointer"
                  onClick={() => {
                    if (!isRead(n)) markAsRead(n._id);
                    if (n.link) window.location.href = n.link;
                  }}
                >
                  {/* Read indicator */}
                  <div className="mt-1">
                    {isRead(n) ? (
                      <CheckCheck className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />
                    )}
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <Badge
                        variant={isReminder(n) ? "destructive" : "outline"}
                        className="text-[10px] uppercase"
                      >
                        {isReminder(n) ? "REMINDER" : n.type}
                      </Badge>

                      <span className="text-[10px] text-muted-foreground">
                        {new Date(n.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <p
                      className={`text-xs leading-snug ${
                        isReminder(n) && !isRead(n)
                          ? "font-medium text-orange-600"
                          : ""
                      }`}
                    >
                      {n.message}
                    </p>

                    {!isRead(n) && (
                      <Button
                        variant="ghost"
                        className="px-0 text-[11px] text-blue-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(n._id);
                        }}
                      >
                        Mark as read
                      </Button>
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
          </ScrollArea>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
