import { createContext, useContext, ReactNode } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';

// Hub Admin user interface
export interface HubAdminUser {
  id: string;
  name: string;
  role: string;
  hubId: string;
  hubName: string;
  tenantId?: string;
  email?: string;
  profileImageUrl?: string;
}

// Hub Admin login credentials
export interface HubAdminLoginCredentials {
  email: string;
  password: string;
  deviceInfo?: any;
}

// Context interface
interface HubAdminAuthContextType {
  hubAdminUser: HubAdminUser | null;
  isLoading: boolean;
  error: any;
  isHubAdminAuthenticated: boolean;
  hubAdminLogin: (credentials: HubAdminLoginCredentials) => Promise<any>;
  hubAdminLogout: () => Promise<void>;
  refetch: () => void;
}

const HubAdminAuthContext = createContext<HubAdminAuthContextType | undefined>(undefined);

// Hub Admin user query function with proper error handling
const fetchCurrentHubAdminUser = async (): Promise<HubAdminUser | null> => {
  try {
    const response = await fetch('/api/hub-admin/session', {
      credentials: 'include',
      headers: {
        'Cache-Control': 'no-cache',
      },
    });

    if (response.status === 401 || response.status === 403) {
      return null; // Not authenticated as hub admin
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch hub admin user: ${response.status}`);
    }

    const data = await response.json();
    
    // Check if the response indicates authenticated hub admin
    if (data.authenticated && data.hubAdmin) {
      return data.hubAdmin;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching current hub admin user:', error);
    throw error;
  }
};

export function HubAdminAuthProvider({ children }: { children: ReactNode }) {
  // Hub Admin authentication query with proper caching
  const {
    data: hubAdminUser,
    isLoading,
    error,
    refetch,
  } = useQuery<HubAdminUser | null>({
    queryKey: ['hub-admin-auth'],
    queryFn: fetchCurrentHubAdminUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: true,
  });

  // Hub Admin login mutation
  const hubAdminLoginMutation = useMutation({
    mutationFn: async (credentials: HubAdminLoginCredentials) => {
      const response = await apiRequest('/api/hub-admin/session', 'POST', credentials);
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch hub admin data after successful login
      queryClient.invalidateQueries({ queryKey: ['hub-admin-auth'] });
    },
    onError: (error) => {
      console.error('Hub Admin login failed:', error);
    },
  });

  // Hub Admin logout mutation
  const hubAdminLogoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('/api/hub-admin/session', 'DELETE');
      return response.json();
    },
    onSuccess: () => {
      // Clear hub admin data from cache after logout
      queryClient.setQueryData(['hub-admin-auth'], null);
      // Invalidate hub admin-related queries
      queryClient.invalidateQueries({ queryKey: ['hub-admin-auth'] });
    },
    onError: (error) => {
      console.error('Hub Admin logout failed:', error);
      // Even if logout fails on server, clear local state
      queryClient.setQueryData(['hub-admin-auth'], null);
    },
  });

  const value: HubAdminAuthContextType = {
    hubAdminUser: hubAdminUser || null,
    isLoading: isLoading || hubAdminLoginMutation.isPending || hubAdminLogoutMutation.isPending,
    error: error || hubAdminLoginMutation.error || hubAdminLogoutMutation.error,
    isHubAdminAuthenticated: !!hubAdminUser,
    hubAdminLogin: hubAdminLoginMutation.mutateAsync,
    hubAdminLogout: hubAdminLogoutMutation.mutateAsync,
    refetch,
  };

  return (
    <HubAdminAuthContext.Provider value={value}>
      {children}
    </HubAdminAuthContext.Provider>
  );
}

// Hook to use the hub admin auth context
export function useHubAdminAuth(): HubAdminAuthContextType {
  const context = useContext(HubAdminAuthContext);
  if (context === undefined) {
    throw new Error('useHubAdminAuth must be used within a HubAdminAuthProvider');
  }
  return context;
}
