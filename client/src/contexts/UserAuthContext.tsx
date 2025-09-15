import { createContext, useContext, ReactNode } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';

// User interface for regular users
export interface User {
  id: string;
  tenantId: string;
  role?: string;
  isSuperAdmin?: boolean;
  email?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  mobileNumber?: string;
  profileImageUrl?: string;
  provider: 'whatsapp' | 'legacy' | 'replit';
}

// Login credentials interfaces
export interface LoginCredentials {
  email?: string;
  mobileNumber?: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  company?: string;
}

// Context interface
interface UserAuthContextType {
  user: User | null;
  isLoading: boolean;
  error: any;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<any>;
  register: (credentials: RegisterCredentials) => Promise<any>;
  logout: () => Promise<void>;
  refetch: () => void;
}

const UserAuthContext = createContext<UserAuthContextType | undefined>(undefined);

// User query function with proper error handling
const fetchCurrentUser = async (): Promise<User | null> => {
  try {
    const response = await fetch('/api/auth/user', {
      credentials: 'include',
      headers: {
        'Cache-Control': 'no-cache',
      },
    });

    if (response.status === 401) {
      return null; // Not authenticated
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch user: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching current user:', error);
    throw error;
  }
};

export function UserAuthProvider({ children }: { children: ReactNode }) {
  // User authentication query with proper caching
  const {
    data: user,
    isLoading,
    error,
    refetch,
  } = useQuery<User | null>({
    queryKey: ['user-auth'],
    queryFn: fetchCurrentUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: true,
    // No refetchInterval - one-shot check only
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await apiRequest('/api/auth/login', 'POST', credentials);
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch user data after successful login
      queryClient.invalidateQueries({ queryKey: ['user-auth'] });
    },
    onError: (error) => {
      console.error('Login failed:', error);
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (credentials: RegisterCredentials) => {
      const response = await apiRequest('/api/auth/register', 'POST', credentials);
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch user data after successful registration
      queryClient.invalidateQueries({ queryKey: ['user-auth'] });
    },
    onError: (error) => {
      console.error('Registration failed:', error);
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('/api/auth/logout', 'POST');
      return response.json();
    },
    onSuccess: () => {
      // Clear user data from cache after logout
      queryClient.setQueryData(['user-auth'], null);
      // Optionally invalidate other user-related queries
      queryClient.invalidateQueries({ queryKey: ['user-auth'] });
    },
    onError: (error) => {
      console.error('Logout failed:', error);
      // Even if logout fails on server, clear local state
      queryClient.setQueryData(['user-auth'], null);
    },
  });

  const value: UserAuthContextType = {
    user: user || null,
    isLoading: isLoading || loginMutation.isPending || registerMutation.isPending || logoutMutation.isPending,
    error: error || loginMutation.error || registerMutation.error || logoutMutation.error,
    isAuthenticated: !!user,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    refetch,
  };

  return (
    <UserAuthContext.Provider value={value}>
      {children}
    </UserAuthContext.Provider>
  );
}

// Hook to use the user auth context
export function useUserAuth(): UserAuthContextType {
  const context = useContext(UserAuthContext);
  if (context === undefined) {
    throw new Error('useUserAuth must be used within a UserAuthProvider');
  }
  return context;
}

// Backward compatibility hook
export function useAuth() {
  return useUserAuth();
}