'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Bell, Check, ExternalLink, Clock, AlertCircle } from 'lucide-react';
import { Notification } from '@/types/notified';

interface NotifiedProps {
  userId: string;
  showBadge?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

const Notified: React.FC<NotifiedProps> = ({
  userId,
  showBadge = true,
  autoRefresh = true,
  refreshInterval = 30000, // 30 seconds
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());

  const unreadCount = notifications.filter((n) => !n.read).length;

  const fetchNotifications = useCallback(async () => {
    if (!userId) {
      setError('User ID is required');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/notifications', {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data: Notification[] = await response.json();
      setNotifications(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setError(err instanceof Error ? err.message : 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const markAsRead = async (notificationId: string) => {
    if (updatingIds.has(notificationId)) return;

    try {
      setUpdatingIds((prev) => new Set(prev).add(notificationId));

      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notificationId ? { ...n, read: true } : n
        )
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
      setError(err instanceof Error ? err.message : 'Failed to update notification');
    } finally {
      setUpdatingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(notificationId);
        return newSet;
      });
    }
  };

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter((n) => !n.read);
    if (unreadNotifications.length === 0) return;

    try {
      // Mark all as read optimistically
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true }))
      );

      // Send requests for each unread notification
      await Promise.allSettled(
        unreadNotifications.map((n) =>
          fetch(`/api/notifications/${n._id}/read`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
          })
        )
      );

      // Refetch to ensure consistency
      await fetchNotifications();
    } catch (err) {
      console.error('Failed to mark all as read:', err);
      setError('Failed to mark all notifications as read');
      // Revert optimistic update on error
      await fetchNotifications();
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await markAsRead(notification._id);
    }

    if (notification.link) {
      window.open(notification.link, '_blank', 'noopener,noreferrer');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    }
    return date.toLocaleDateString();
  };

  const getTypeIcon = (type: 'task' | 'work') => {
    switch (type) {
      case 'task':
        return <Check className="w-4 h-4 text-blue-500" />;
      case 'work':
        return <Clock className="w-4 h-4 text-green-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications, userId]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh || !isOpen) return;

    const intervalId = setInterval(fetchNotifications, refreshInterval);
    return () => clearInterval(intervalId);
  }, [autoRefresh, fetchNotifications, refreshInterval, isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.notifications-dropdown')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen]);

  if (loading && notifications.length === 0) {
    return (
      <div className="relative notifications-dropdown">
        <button
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          disabled
        >
          <Bell className="w-5 h-5 text-gray-400 animate-pulse" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative notifications-dropdown">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {showBadge && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-red-500 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Mark all as read
                </button>
              )}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {error ? (
              <div className="p-4 text-center">
                <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                <p className="text-sm text-red-600">{error}</p>
                <button
                  onClick={fetchNotifications}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                >
                  Try again
                </button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getTypeIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm ${
                            notification.read
                              ? 'text-gray-700'
                              : 'text-gray-900 font-medium'
                          }`}
                        >
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">
                            {formatDate(notification.createdAt)}
                          </span>
                          <div className="flex items-center gap-2">
                            {notification.link && (
                              <ExternalLink className="w-3 h-3 text-gray-400" />
                            )}
                            {!notification.read && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification._id);
                                }}
                                disabled={updatingIds.has(notification._id)}
                                className="text-xs text-blue-600 hover:text-blue-800 disabled:text-gray-400"
                              >
                                {updatingIds.has(notification._id)
                                  ? 'Marking...'
                                  : 'Mark read'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200">
              <button
                onClick={fetchNotifications}
                disabled={loading}
                className="w-full text-center text-sm text-gray-600 hover:text-gray-900 disabled:text-gray-400"
              >
                {loading ? 'Refreshing...' : 'Refresh notifications'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Notified;