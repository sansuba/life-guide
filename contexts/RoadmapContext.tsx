import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import type { Milestone } from '../types';
import { AuthContext } from './AuthContext';

const getStorageKey = (username: string | null) => `onspace_milestones_${username}`;

interface RoadmapContextType {
  milestones: Milestone[];
  addMilestone: (title: string, note: string, date: string, category: 'learning' | 'expenses' | 'milestones' | 'achievements' | 'acknowledgements') => void;
  toggleMilestone: (id: string) => void;
  deleteMilestone: (id: string) => void;
}

export const RoadmapContext = createContext<RoadmapContextType | undefined>(undefined);

export function RoadmapProvider({ children }: { children: ReactNode }) {
  const auth = useContext(AuthContext);
  const [milestones, setMilestones] = useState<Milestone[]>([]);

  // Load milestones from storage when user changes
  useEffect(() => {
    if (auth?.currentUser) {
      loadMilestones(auth.currentUser);
    } else {
      setMilestones([]);
    }
  }, [auth?.currentUser]);

  const loadMilestones = async (username: string) => {
    try {
      const stored = await AsyncStorage.getItem(getStorageKey(username));
      if (stored) {
        setMilestones(JSON.parse(stored));
      } else {
        setMilestones([]);
      }
    } catch (error) {
      console.error('Failed to load milestones:', error);
      setMilestones([]);
    }
  };

  const saveMilestones = async (milestonesToSave: Milestone[]) => {
    if (!auth?.currentUser) return;
    try {
      await AsyncStorage.setItem(getStorageKey(auth.currentUser), JSON.stringify(milestonesToSave));
    } catch (error) {
      console.error('Failed to save milestones:', error);
    }
  };

  const addMilestone = (title: string, note: string, date: string, category: 'learning' | 'expenses' | 'milestones' | 'achievements' | 'acknowledgements' = 'milestones') => {
    const newMilestone: Milestone = {
      id: Date.now().toString(),
      title,
      note,
      date,
      category,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    const updated = [...milestones, newMilestone];
    setMilestones(updated);
    saveMilestones(updated);
  };

  const toggleMilestone = (id: string) => {
    const updated = milestones.map(milestone =>
      milestone.id === id
        ? { ...milestone, completed: !milestone.completed }
        : milestone
    );
    setMilestones(updated);
    saveMilestones(updated);
  };

  const deleteMilestone = (id: string) => {
    const updated = milestones.filter(milestone => milestone.id !== id);
    setMilestones(updated);
    saveMilestones(updated);
  };

  return (
    <RoadmapContext.Provider value={{ milestones, addMilestone, toggleMilestone, deleteMilestone }}>
      {children}
    </RoadmapContext.Provider>
  );
}
