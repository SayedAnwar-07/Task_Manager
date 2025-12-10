import { Task, CreateTaskData, UpdateTaskData } from '@/types/task';
import { apiFetch } from './api';

export const taskApi = {
  // Get all tasks
  getAll: async (params?: { search?: string; status?: string }): Promise<Task[]> => {
    let query = '';
    if (params) {
      const queryParams = new URLSearchParams();
      if (params.search) queryParams.append('search', params.search);
      if (params.status) queryParams.append('status', params.status);
      query = `?${queryParams.toString()}`;
    }
    return apiFetch(`/api/tasks${query}`);
  },

  // Get single task
  getById: async (id: string): Promise<Task> => {
    return apiFetch(`/api/tasks/${id}`);
  },

  // Create task
  create: async (data: CreateTaskData): Promise<Task> => {
    return apiFetch('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update task
  update: async (id: string, data: UpdateTaskData): Promise<Task> => {
    return apiFetch(`/api/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete task
  delete: async (id: string): Promise<{ message: string }> => {
    return apiFetch(`/api/tasks/${id}`, {
      method: 'DELETE',
    });
  },
};