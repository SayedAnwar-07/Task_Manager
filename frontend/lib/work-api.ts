import { Work, CreateWorkData, UpdateWorkData } from '@/types/work';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://task-manager-two-mu-42.vercel.app/api';
// const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const workApi = {
  getByTaskId: async (taskId: string): Promise<Work[]> => {
    const res = await fetch(`${API_URL}/tasks/${taskId}/works`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    if (!res.ok) throw new Error('Failed to fetch works');
    return res.json();
  },

  // Get single work
  getById: async (id: string): Promise<Work> => {
    const res = await fetch(`${API_URL}/works/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    if (!res.ok) throw new Error('Failed to fetch work');
    return res.json();
  },

  // Create work with images
  create: async (taskId: string, data: CreateWorkData): Promise<Work> => {
    const formData = new FormData();
    formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    if (data.shareUrl) formData.append("shareUrl", data.shareUrl);
    if (data.timeRange) formData.append('timeRange', data.timeRange);
    
    if (data.images) {
      data.images.forEach((image) => {
        formData.append('images', image);
      });
    }

    const res = await fetch(`${API_URL}/tasks/${taskId}/works`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData,
    });
    if (!res.ok) throw new Error('Failed to create work');
    return res.json();
  },

  // Update work
  update: async (id: string, data: UpdateWorkData): Promise<Work> => {
    const formData = new FormData();
    if (data.title) formData.append('title', data.title);
    if (data.description !== undefined) formData.append('description', data.description || '');
    if (data.shareUrl !== undefined)formData.append("shareUrl", data.shareUrl);
    if (data.timeRange) formData.append('timeRange', data.timeRange);
    
    if (data.removeImagePublicIds) {
      formData.append('removeImagePublicIds', JSON.stringify(data.removeImagePublicIds));
    } 
    
    if (data.images) {
      data.images.forEach((image) => {
        formData.append('images', image);
      });
    }

    const res = await fetch(`${API_URL}/works/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData,
    });
    if (!res.ok) throw new Error('Failed to update work');
    return res.json();
  },

  // Delete work
  delete: async (id: string): Promise<void> => {
    const res = await fetch(`${API_URL}/works/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    if (!res.ok) throw new Error('Failed to delete work');
  },
};