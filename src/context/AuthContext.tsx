import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Participant } from '../types.js';
import { apiRequest, setAuthToken, removeAuthToken, getAuthToken } from '../lib/api.js';

interface AuthContextType {
  user: User | null;
  participant: Participant | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshProfile = async () => {
    const token = getAuthToken();
    if (!token) {
      setUser(null);
      setParticipant(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await apiRequest('/auth/me');
      setUser(res.user);
      setParticipant(res.participant || null);
    } catch (err) {
      console.warn('Session expired or invalid:', err);
      removeAuthToken();
      setUser(null);
      setParticipant(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshProfile();
  }, []);

  const login = async (username: string, password: string) => {
    const res = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    setAuthToken(res.token);
    setUser(res.user);
    setParticipant(res.participant || null);
  };

  const register = async (data: any) => {
    const res = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    setAuthToken(res.token);
    setUser(res.user);
    setParticipant(res.participant);
  };

  const logout = () => {
    removeAuthToken();
    setUser(null);
    setParticipant(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        participant,
        isLoading,
        login,
        register,
        logout,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
