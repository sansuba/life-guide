import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import type { WebLink } from '../types';
import { AuthContext } from './AuthContext';

const getStorageKey = (username: string | null) => `onspace_links_${username}`;

interface LinksContextType {
  links: WebLink[];
  addLink: (title: string, url: string, description?: string) => void;
  deleteLink: (id: string) => void;
  hideLink: (id: string) => void;
  unhideLink: (id: string) => void;
  showHidden: boolean;
  setShowHidden: (show: boolean) => void;
}

export const LinksContext = createContext<LinksContextType | undefined>(undefined);

export function LinksProvider({ children }: { children: ReactNode }) {
  const auth = useContext(AuthContext);
  const [links, setLinks] = useState<WebLink[]>([]);
  const [showHidden, setShowHidden] = useState(false);

  // Load links from storage when user changes
  useEffect(() => {
    if (auth?.currentUser) {
      loadLinks(auth.currentUser);
    } else {
      setLinks([]);
    }
  }, [auth?.currentUser]);

  const loadLinks = async (username: string) => {
    try {
      const stored = await AsyncStorage.getItem(getStorageKey(username));
      if (stored) {
        setLinks(JSON.parse(stored));
      } else {
        setLinks([]);
      }
    } catch (error) {
      console.error('Failed to load links:', error);
      setLinks([]);
    }
  };

  const saveLinks = async (linksToSave: WebLink[]) => {
    if (!auth?.currentUser) return;
    try {
      await AsyncStorage.setItem(getStorageKey(auth.currentUser), JSON.stringify(linksToSave));
    } catch (error) {
      console.error('Failed to save links:', error);
    }
  };

  const addLink = (title: string, url: string, description?: string) => {
    const newLink: WebLink = {
      id: Date.now().toString(),
      title,
      url,
      description,
      createdAt: new Date().toISOString(),
    };
    const updated = [newLink, ...links];
    setLinks(updated);
    saveLinks(updated);
  };

  const deleteLink = (id: string) => {
    const updated = links.filter(link => link.id !== id);
    setLinks(updated);
    saveLinks(updated);
  };

  const hideLink = (id: string) => {
    const updated = links.map(link =>
      link.id === id ? { ...link, hidden: true } : link
    );
    setLinks(updated);
    saveLinks(updated);
  };

  const unhideLink = (id: string) => {
    const updated = links.map(link =>
      link.id === id ? { ...link, hidden: false } : link
    );
    setLinks(updated);
    saveLinks(updated);
  };

  return (
    <LinksContext.Provider value={{ links, addLink, deleteLink, hideLink, unhideLink, showHidden, setShowHidden }}>
      {children}
    </LinksContext.Provider>
  );
}
