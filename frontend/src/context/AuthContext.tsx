'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../lib/types';
import { fetchApi } from '../lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  demoLogin: (role: UserRole) => Promise<void>;
  logout: () => void;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('slideshield_token');
    const savedUser = localStorage.getItem('slideshield_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error(e);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const data: any = await fetchApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    setToken(data.access_token);
    localStorage.setItem('slideshield_token', data.access_token);

    // Fetch full profile
    const profile: User = await fetchApi('/auth/me', {
      headers: { Authorization: `Bearer ${data.access_token}` },
    });

    setUser(profile);
    localStorage.setItem('slideshield_user', JSON.stringify(profile));
  };

  const demoLogin = async (role: UserRole) => {
    let email = 'citizen@slideshield.org';
    let password = 'citizen123';
    if (role === 'Government Officer') {
      email = 'officer@slideshield.org';
      password = 'officer123';
    } else if (role === 'Admin') {
      email = 'admin@slideshield.org';
      password = 'admin123';
    }

    try {
      await login(email, password);
    } catch (err) {
      // Fallback local demo state if backend isn't actively reachable
      const mockUser: User = {
        id: role === 'Citizen' ? 1 : role === 'Government Officer' ? 2 : 3,
        email,
        full_name: role === 'Citizen' ? 'Rajesh Kumar (Citizen)' : role === 'Government Officer' ? 'Dr. Anita Nair (Officer)' : 'System Administrator',
        role,
        phone: '+91 98470 11223',
        district: 'Wayanad',
        state: 'Kerala',
        is_active: true,
        is_verified: true,
        created_at: new Date().toISOString()
      };
      setToken('mock-jwt-token-slideshield');
      setUser(mockUser);
      localStorage.setItem('slideshield_token', 'mock-jwt-token-slideshield');
      localStorage.setItem('slideshield_user', JSON.stringify(mockUser));
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('slideshield_token');
    localStorage.removeItem('slideshield_user');
  };

  const updateUserProfile = async (data: Partial<User>) => {
    if (!user) return;
    try {
      const updated: User = await fetchApi('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      setUser(updated);
      localStorage.setItem('slideshield_user', JSON.stringify(updated));
    } catch (e) {
      const merged = { ...user, ...data };
      setUser(merged);
      localStorage.setItem('slideshield_user', JSON.stringify(merged));
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, demoLogin, logout, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
