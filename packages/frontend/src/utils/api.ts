interface User {
  id: string;
  username: string;
  createdAt: string;
}

interface Tweep {
  id: string;
  username: string;
  duration: string;
  createdAt: string;
}

export const api = {
  // Get user by username (public)
  getUserByUsername: async (username: string): Promise<{ user: User } | null> => {
    try {
      const response = await fetch(`/api/users/${username}`);
      
      if (response.ok) {
        return await response.json();
      } else if (response.status === 404) {
        return null; // User not found
      } else {
        throw new Error('Failed to fetch user');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  },

  // Get all users (public)
  getAllUsers: async (limit: number = 50): Promise<{ users: User[]; count: number }> => {
    try {
      const response = await fetch(`/api/users?limit=${limit}`);
      
      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      return { users: [], count: 0 };
    }
  },

  // Tweep operations
  getAllTweeps: async (): Promise<{ tweeps: Tweep[] }> => {
    try {
      const response = await fetch('/api/tweeps');
      
      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('Failed to fetch tweeps');
      }
    } catch (error) {
      console.error('Error fetching tweeps:', error);
      return { tweeps: [] };
    }
  },

  getTweepsByUsername: async (username: string): Promise<{ tweeps: Tweep[] }> => {
    try {
      const response = await fetch(`/api/tweeps/user/${username}`);
      
      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('Failed to fetch user tweeps');
      }
    } catch (error) {
      console.error('Error fetching user tweeps:', error);
      return { tweeps: [] };
    }
  },

  createTweep: async (audioBlob: Blob, duration: string): Promise<{ tweep: Tweep } | null> => {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const formData = new FormData();
      formData.append('audio', audioBlob, 'tweep.wav');
      formData.append('duration', duration);

      const response = await fetch('/api/tweeps', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        return await response.json();
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }
    } catch (error) {
      console.error('Error creating tweep:', error);
      return null;
    }
  },

  deleteTweep: async (tweepId: string): Promise<boolean> => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`/api/tweeps/${tweepId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Error deleting tweep:', error);
      return false;
    }
  },

  getAudioUrl: (tweepId: string): string => {
    return `/api/tweeps/${tweepId}/audio`;
  },

  // Test API connectivity
  testConnection: async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/hello');
      return response.ok;
    } catch (error) {
      console.error('API connection test failed:', error);
      return false;
    }
  }
}; 