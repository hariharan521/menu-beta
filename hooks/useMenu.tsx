'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { MenuData } from '@/types/menu';

interface MenuContextType {
  menuData: MenuData | null;
  loading: boolean;
  error: string | null;
  refreshMenu: () => Promise<void>;
  saveMenu: (updatedData: MenuData, token: string) => Promise<boolean>;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export function MenuProvider({ children }: { children: React.ReactNode }) {
  const [menuData, setMenuData] = useState<MenuData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMenu = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/menu');
      if (!res.ok) {
        throw new Error('Failed to fetch menu data');
      }
      const data = await res.json();
      setMenuData(data);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, []);

  const saveMenu = useCallback(async (updatedData: MenuData, token: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/menu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
        body: JSON.stringify(updatedData),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to save menu data');
      }

      setMenuData(updatedData);
      return true;
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  return (
    <MenuContext.Provider value={{ menuData, loading, error, refreshMenu: fetchMenu, saveMenu }}>
      {children}
    </MenuContext.Provider>
  );
}

export function useMenu() {
  const context = useContext(MenuContext);
  if (context === undefined) {
    throw new Error('useMenu must be used within a MenuProvider');
  }
  return context;
}
