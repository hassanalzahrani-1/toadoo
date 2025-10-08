import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authAPI } from '@/lib/api';

interface User {
  id: number;
  email: string;
  username: string;
  role: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem('access_token');
    if (token) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await authAPI.getCurrentUser();
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch current user:', error);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    const response = await authAPI.login(username, password);
    const { access_token, refresh_token } = response.data;
    
    console.log('Login response:', { access_token, refresh_token });
    
    // Set tokens in localStorage first
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);
    
    console.log('Tokens saved to localStorage');
    console.log('Access token from storage:', localStorage.getItem('access_token'));
    
    // Fetch user with the new token
    try {
      const userResponse = await authAPI.getCurrentUser();
      console.log('User fetched:', userResponse.data);
      setUser(userResponse.data);
    } catch (error) {
      console.error('Failed to fetch user after login:', error);
      throw error;
    }
  };

  const register = async (email: string, username: string, password: string) => {
    await authAPI.register(email, username, password);
    // Auto-login after registration
    await login(username, password);
  };

  const logout = () => {
    authAPI.logout().catch(() => {});
    
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
