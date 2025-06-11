import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { api } from '../utils/api';

// Interface for tweep data to match backend
export interface TweepData {
  id: string;
  username: string;
  duration: string;
  createdAt: string;
}

interface TweepsContextType {
  tweeps: TweepData[];
  tweepsByUser: Record<string, TweepData[]>;
  loading: boolean;
  addTweep: (audioBlob: Blob, duration: string) => Promise<boolean>;
  deleteTweep: (tweepId: string) => Promise<boolean>;
  refreshTweeps: () => Promise<void>;
  refreshUserTweeps: (username: string) => Promise<void>;
}

const TweepsContext = createContext<TweepsContextType | undefined>(undefined);

export const useTweeps = () => {
  const context = useContext(TweepsContext);
  if (!context) {
    throw new Error('useTweeps must be used within a TweepsProvider');
  }
  return context;
};

interface TweepsProviderProps {
  children: ReactNode;
}

export const TweepsProvider = ({ children }: TweepsProviderProps) => {
  const [tweeps, setTweeps] = useState<TweepData[]>([]);
  const [tweepsByUser, setTweepsByUser] = useState<Record<string, TweepData[]>>({});
  const [loading, setLoading] = useState(true);

  // Load all tweeps from backend
  const refreshTweeps = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.getAllTweeps();
      setTweeps(response.tweeps);
    } catch (error) {
      console.error('Error refreshing tweeps:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load tweeps for a specific user
  const refreshUserTweeps = useCallback(async (username: string) => {
    try {
      const response = await api.getTweepsByUsername(username);
      setTweepsByUser(prev => ({
        ...prev,
        [username]: response.tweeps
      }));
    } catch (error) {
      console.error('Error refreshing user tweeps:', error);
    }
  }, []);

  // Load all tweeps on mount
  useEffect(() => {
    refreshTweeps();
  }, [refreshTweeps]);

  // Add a new tweep
  const addTweep = useCallback(async (audioBlob: Blob, duration: string): Promise<boolean> => {
    try {
      const response = await api.createTweep(audioBlob, duration);
      
      if (response) {
        // Refresh tweeps to get the updated list
        await refreshTweeps();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error adding tweep:', error);
      return false;
    }
  }, [refreshTweeps]);

  // Delete a tweep
  const deleteTweep = useCallback(async (tweepId: string): Promise<boolean> => {
    try {
      const success = await api.deleteTweep(tweepId);
      if (success) {
        // Remove from all tweeps
        setTweeps(prev => prev.filter(tweep => tweep.id !== tweepId));
        
        // Remove from user-specific tweeps
        setTweepsByUser(prev => {
          const updated = { ...prev };
          Object.keys(updated).forEach(username => {
            updated[username] = updated[username].filter(tweep => tweep.id !== tweepId);
          });
          return updated;
        });
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting tweep:', error);
      return false;
    }
  }, []);

  return (
    <TweepsContext.Provider value={{ 
      tweeps, 
      tweepsByUser, 
      loading, 
      addTweep, 
      deleteTweep, 
      refreshTweeps, 
      refreshUserTweeps 
    }}>
      {children}
    </TweepsContext.Provider>
  );
}; 