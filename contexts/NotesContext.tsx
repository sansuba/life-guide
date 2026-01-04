import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import type { Note } from '../types';
import { AuthContext } from './AuthContext';

const getStorageKey = (username: string | null) => `onspace_notes_${username}`;

interface NotesContextType {
  notes: Note[];
  addNote: (title: string, content: string, images?: string[]) => void;
  updateNote: (id: string, title: string, content: string, images?: string[]) => void;
  deleteNote: (id: string) => void;
}

export const NotesContext = createContext<NotesContextType | undefined>(undefined);

export function NotesProvider({ children }: { children: ReactNode }) {
  const auth = useContext(AuthContext);
  const [notes, setNotes] = useState<Note[]>([]);

  // Load notes from storage when user changes
  useEffect(() => {
    if (auth?.currentUser) {
      loadNotes(auth.currentUser);
    } else {
      setNotes([]);
    }
  }, [auth?.currentUser]);

  const loadNotes = async (username: string) => {
    try {
      const stored = await AsyncStorage.getItem(getStorageKey(username));
      if (stored) {
        setNotes(JSON.parse(stored));
      } else {
        setNotes([]);
      }
    } catch (error) {
      console.error('Failed to load notes:', error);
      setNotes([]);
    }
  };

  const saveNotes = async (notesToSave: Note[]) => {
    if (!auth?.currentUser) return;
    try {
      await AsyncStorage.setItem(getStorageKey(auth.currentUser), JSON.stringify(notesToSave));
    } catch (error) {
      console.error('Failed to save notes:', error);
    }
  };

  const addNote = (title: string, content: string, images: string[] = []) => {
    const newNote: Note = {
      id: Date.now().toString(),
      title,
      content,
      images: images.length > 0 ? images : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [newNote, ...notes];
    setNotes(updated);
    saveNotes(updated);
  };

  const updateNote = (id: string, title: string, content: string, images: string[] = []) => {
    const updated = notes.map(note =>
      note.id === id
        ? {
          ...note,
          title,
          content,
          images: images.length > 0 ? images : undefined,
          updatedAt: new Date().toISOString()
        }
        : note
    );
    setNotes(updated);
    saveNotes(updated);
  };

  const deleteNote = (id: string) => {
    const updated = notes.filter(note => note.id !== id);
    setNotes(updated);
    saveNotes(updated);
  };

  return (
    <NotesContext.Provider value={{ notes, addNote, updateNote, deleteNote }}>
      {children}
    </NotesContext.Provider>
  );
}
