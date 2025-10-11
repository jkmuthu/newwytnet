import { createContext, useContext, ReactNode } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';

// Admin user interface
export interface AdminUser {
  id: string;
  name: string;
  role: string;
  isSuperAdmin: boolean;
  tenantId?: string;
  email?: string;
  profileImageUrl?: string;
}

// Admin login credentials
export interface AdminLoginCredentials {
  email: string;
  password: string;
  deviceInfo?: any;
}

// Admin MFA verification
export interface AdminMFACredentials {
  email: string;
  mfaCode: string;
  rememberDevice?: boolean;
}

// Context interface
interface AdminAuthContextType {
  adminUser: AdminUser | null;
  isLoading: boolean;
  error: any;
  isAdminAuthenticated: boolean;
  adminLogin: (credentials: AdminLoginCredentials) => Promise<any>;
  adminMFAVerify: (credentials: AdminMFACredentials) => Promise<any>;
  adminLogout: () => Promise<void>;
  refetch: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

// Admin user query function with proper error handling
const fetchCurrentAdminUser = async (): Promise<AdminUser | null> => {
  try {
    const response = await fetch('/api/admin/session', {
      credentials: 'include',
      headers: {
        'Cache-Control': 'no-cache',
      },
    });

    if (response.status === 401 || response.status === 403) {
      return null; // Not authenticated as admin
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch admin user: ${response.status}`);
    }

    const data = await response.json();
    
    // Check if the response indicates authenticated admin
    if (data.authenticated && data.admin) {
      return data.admin;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching current admin user:', error);
    throw error;
  }
};

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  // Admin authentication query with proper caching
  const {
    data: adminUser,
    isLoading,
    error,
    refetch,
  } = useQuery<AdminUser | null>({
    queryKey: ['admin-auth'],
    queryFn: fetchCurrentAdminUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: true,
    // No refetchInterval - one-shot check only
  });

  // Admin login mutation
  const adminLoginMutation = useMutation({
    mutationFn: async (credentials: AdminLoginCredentials) => {
      const response = await apiRequest('/api/admin/session', 'POST', credentials);
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch admin data after successful login
      queryClient.invalidateQueries({ queryKey: ['admin-auth'] });
    },
    onError: (error) => {
      console.error('Admin login failed:', error);
    },
  });

  // Admin MFA verification mutation (not used with new system, kept for compatibility)
  const adminMFAMutation = useMutation({
    mutationFn: async (credentials: AdminMFACredentials) => {
      // New admin auth doesn't use MFA yet
      return { success: false, error: 'MFA not implemented' };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-auth'] });
    },
    onError: (error) => {
      console.error('Admin MFA verification failed:', error);
    },
  });

  // Admin logout mutation
  const adminLogoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('/api/admin/session', 'DELETE');
      return response.json();
    },
    onSuccess: () => {
      // Clear admin data from cache after logout
      queryClient.setQueryData(['admin-auth'], null);
      // Invalidate admin-related queries
      queryClient.invalidateQueries({ queryKey: ['admin-auth'] });
    },
    onError: (error) => {
      console.error('Admin logout failed:', error);
      // Even if logout fails on server, clear local state
      queryClient.setQueryData(['admin-auth'], null);
    },
  });

  const value: AdminAuthContextType = {
    adminUser: adminUser || null,
    isLoading: isLoading || adminLoginMutation.isPending || adminMFAMutation.isPending || adminLogoutMutation.isPending,
    error: error || adminLoginMutation.error || adminMFAMutation.error || adminLogoutMutation.error,
    isAdminAuthenticated: !!adminUser,
    adminLogin: adminLoginMutation.mutateAsync,
    adminMFAVerify: adminMFAMutation.mutateAsync,
    adminLogout: adminLogoutMutation.mutateAsync,
    refetch,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

// Hook to use the admin auth context
export function useAdminAuth(): AdminAuthContextType {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}