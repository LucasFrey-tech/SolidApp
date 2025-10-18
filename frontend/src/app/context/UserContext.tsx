'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';

interface UserContextType {
  user:{ email: string , sub: number, username: string, admin: boolean,userSubscriptions?: { active: boolean }[]; } | null;
  setUser: (user: { email: string , sub: number, username: string, admin: boolean } | null) => void;
  refreshUser: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<{ email: string , sub: number, username: string, admin: boolean } | null>(null);

  const refreshUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      return;
    }
    const decodedToken = jwtDecode<{ email: string , sub: number, username: string, admin: boolean}>(token); 

    setUser(decodedToken);
  };

  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};