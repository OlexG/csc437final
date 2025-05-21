import { createContext, useState, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';

// Interface for tweep data
export interface TweepData {
  id: number;
  duration: string;
  timestamp: number;
}

interface TweepsContextType {
  tweeps: Record<string, TweepData[]>;
  addTweep: (username: string, duration: string) => void;
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
  // Mock data for initial state
  const defaultTweeps = {
    lisa: [
      { id: 1, duration: "1:32 min", timestamp: Date.now() - 100000 },
      { id: 2, duration: "2:15 min", timestamp: Date.now() - 200000 },
      { id: 3, duration: "0:58 min", timestamp: Date.now() - 300000 },
    ],
    owen: [
      { id: 1, duration: "0:35 min", timestamp: Date.now() - 400000 },
      { id: 2, duration: "1:42 min", timestamp: Date.now() - 500000 },
    ],
    alex: [
      { id: 1, duration: "2:30 min", timestamp: Date.now() - 600000 },
      { id: 2, duration: "1:15 min", timestamp: Date.now() - 700000 },
    ],
    oleks: [
      { id: 1, duration: "3:12 min", timestamp: Date.now() - 800000 },
      { id: 2, duration: "0:45 min", timestamp: Date.now() - 900000 },
      { id: 3, duration: "1:20 min", timestamp: Date.now() - 1000000 },
    ]
  };

  const [tweeps, setTweeps] = useState<Record<string, TweepData[]>>(defaultTweeps);

  // Load tweeps from localStorage on mount
  useEffect(() => {
    const storedOleksTweeps = localStorage.getItem("oleksTweeps");
    if (storedOleksTweeps) {
      const parsedTweeps = JSON.parse(storedOleksTweeps);
      setTweeps(prev => ({
        ...prev,
        oleks: parsedTweeps
      }));
    } else {
      // Initialize localStorage with default tweeps for oleks
      localStorage.setItem("oleksTweeps", JSON.stringify(defaultTweeps.oleks));
    }
  }, []);

  // Add a new tweep for a user
  const addTweep = (username: string, duration: string) => {
    const userTweeps = tweeps[username] || [];
    
    // Generate a new ID
    const newId = userTweeps.length > 0 
      ? Math.max(...userTweeps.map(t => t.id)) + 1 
      : 1;
    
    // Format duration to ensure it has "min" suffix
    const formattedDuration = duration.includes("min") 
      ? duration 
      : `${duration} min`;
    
    // Create the new tweep
    const newTweep: TweepData = {
      id: newId,
      duration: formattedDuration,
      timestamp: Date.now()
    };
    
    // Update state with new tweep at the beginning
    const updatedUserTweeps = [newTweep, ...userTweeps];
    setTweeps(prev => ({
      ...prev,
      [username]: updatedUserTweeps
    }));
    
    // Update localStorage for oleks
    if (username === 'oleks') {
      localStorage.setItem("oleksTweeps", JSON.stringify(updatedUserTweeps));
    }
  };

  return (
    <TweepsContext.Provider value={{ tweeps, addTweep }}>
      {children}
    </TweepsContext.Provider>
  );
}; 