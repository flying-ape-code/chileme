import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User, getCurrentUser, logout as authLogout } from '../lib/auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 加载当前用户
  const loadUser = useCallback(async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Error loading user:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 组件挂载时加载用户
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // 登录（由调用方提供用户信息）
  const login = useCallback((userData: User) => {
    setUser(userData);
    setIsLoading(false);
  }, []);

  // 退出
  const logout = useCallback(async () => {
    try {
      await authLogout();
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  }, []);

  // 刷新用户信息
  const refreshUser = useCallback(async () => {
    await loadUser();
  }, [loadUser]);

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    refreshUser,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
