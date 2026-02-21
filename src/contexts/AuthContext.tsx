import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { User } from '@/types';
import { api } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, name: string, sectionId: string, inviteCode?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('kepler_token');
    if (token) {
      api.getMe()
        .then(userData => {
          setUser({
            id: userData._id,
            email: userData.email,
            name: userData.name,
            role: userData.role,
            avatar: userData.avatar,
            assignedSections: userData.assignedSections?.map((s: any) => s._id || s),
            sectionId: userData.sectionId?._id || userData.sectionId
          });
        })
        .catch(() => {
          localStorage.removeItem('kepler_token');
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await api.login(email, password);
      setUser({
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        role: data.user.role,
        avatar: data.user.avatar,
        assignedSections: data.user.assignedSections,
        sectionId: data.user.sectionId
      });
      setIsLoading(false);
      return { success: true };
    } catch (error: any) {
      setIsLoading(false);
      return { success: false, error: error.message || 'Login failed' };
    }
  }, []);

  const signup = useCallback(async (email: string, password: string, name: string, sectionId: string, inviteCode?: string) => {
    setIsLoading(true);
    try {
      let data;
      if (inviteCode) {
        data = await api.signupTeacher(email, password, name, inviteCode);
      } else {
        data = await api.signup(email, password, name, sectionId);
      }
      
      setUser({
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        role: data.user.role,
        assignedSections: data.user.assignedSections,
        sectionId: data.user.sectionId
      });
      setIsLoading(false);
      return { success: true };
    } catch (error: any) {
      setIsLoading(false);
      return { success: false, error: error.message || 'Signup failed' };
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    api.clearToken();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
