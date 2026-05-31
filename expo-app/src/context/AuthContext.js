import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authService, saveToken, clearToken } from '../services/authService';
import LoadingOverlay from '../components/LoadingOverlay';

const AuthContext = createContext({
  user: null,
  isLoading: false,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  refreshProfile: async () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const profile = await authService.getProfile();
        setUser(profile);
      } catch (_error) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    bootstrap();
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const result = await authService.login(email, password);
      if (result.token) {
        await saveToken(result.token);
        const profile = await authService.getProfile();
        setUser(profile);
      }
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data) => {
    setIsLoading(true);
    try {
      const result = await authService.register(data);
      if (result.token) {
        await saveToken(result.token);
        const profile = await authService.getProfile();
        setUser(profile);
      }
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    setIsLoading(true);
    try {
      const profile = await authService.getProfile();
      setUser(profile);
      return profile;
    } catch (error) {
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      setUser(null);
      await clearToken();
    } finally {
      setIsLoading(false);
    }
  };

  const value = useMemo(
    () => ({ user, isLoading, error, login, register, logout, refreshProfile }),
    [user, isLoading, error]
  );

  if (isLoading) {
    return <LoadingOverlay />;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
