export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'owner' | 'co_owner' | 'project_manager';
  display_image?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export const userApi = {
  // Get all users
  getAll: async (): Promise<User[]> => {
    const response = await fetch('https://task-manager-two-mu-42.vercel.app/api/users', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.status}`);
    }
    
    return response.json() as Promise<User[]>;
  },
};