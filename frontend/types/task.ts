export type TaskStatus = 'pending' | 'in_progress' | 'done';

export interface User {
  _id: string;
  name: string;
  email: string;
  display_image?: string;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  status: TaskStatus;
  startDate: string;
  deadline: string;
  createdBy: User;
  assignedUsers: User[];
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface CreateTaskData {
  title: string;
  description: string;
  status: TaskStatus;
  startDate: string;
  deadline: string;
  assignedUsers: string[];
}

export interface UpdateTaskData extends Partial<CreateTaskData> {}