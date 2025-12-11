export interface Notification {
  _id: string;
  users: string[];
  message: string;
  type: 'task' | 'work';
  read: boolean;
  link?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNotificationPayload {
  userIds: string[];
  message: string;
  type?: 'task' | 'work';
  link?: string;
}

export interface NotificationResponse {
  notifications: Notification[];
  unreadCount: number;
}

export interface MarkAsReadResponse {
  success: boolean;
  notification: Notification;
}

export interface NotificationError {
  message: string;
  status?: number;
}