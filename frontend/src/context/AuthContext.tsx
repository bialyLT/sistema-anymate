import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import axios from 'axios';

import { getApiBaseUrl } from '../lib/api';

interface PersonaData {
  codigo_persona: number;
  nombre: string;
  apellido: string;
  direccion: string;
  telefono: string;
  fecha_nacimiento: string;
}

export interface UserProfileData {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  persona: PersonaData | null;
  grupos?: string[];
}

interface AuthContextType {
  token: string | null;
  isLoading: boolean;
  isProfileLoading: boolean;
  profile: UserProfileData | null;
  isAdmin: boolean;
  isAdminOrEmployee: boolean;
  isNormalUser: boolean;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  const baseURL = getApiBaseUrl();

  const refreshProfile = useCallback(async () => {
    if (!token) {
      setProfile(null);
      return;
    }

    setIsProfileLoading(true);
    try {
      const response = await axios.get(`${baseURL}/api/users/profile/`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      setProfile(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      // If profile fails (e.g. expired token), keep token but clear profile.
      setProfile(null);
    } finally {
      setIsProfileLoading(false);
    }
  }, [baseURL, token]);

  const checkAuth = async () => {
    try {
      const storedToken = window.localStorage.getItem('userToken');
      setToken(storedToken);
    } catch (error) {
      console.error('Error checking auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (newToken: string) => {
    try {
      window.localStorage.setItem('userToken', newToken);
      setToken(newToken);
    } catch (error) {
      console.error('Error saving token:', error);
    }
  };

  const logout = async () => {
    try {
      window.localStorage.removeItem('userToken');
      setToken(null);
      setProfile(null);
    } catch (error) {
      console.error('Error removing token:', error);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (token) {
      refreshProfile();
    } else {
      setProfile(null);
    }
  }, [token, refreshProfile]);

  const grupos = profile?.grupos ?? [];
  const isAdmin = grupos.includes('Administrador');
  const isAdminOrEmployee = isAdmin || grupos.includes('Administrador Empleado');
  const isNormalUser = grupos.includes('Usuario Comun') && !isAdminOrEmployee;

  return (
    <AuthContext.Provider
      value={{
        token,
        isLoading,
        isProfileLoading,
        profile,
        isAdmin,
        isAdminOrEmployee,
        isNormalUser,
        login,
        logout,
        checkAuth,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
