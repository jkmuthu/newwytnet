import { createContext, useContext } from 'react';
import { useQuery } from '@tanstack/react-query';

// Unified Principal interface for all user types (matches backend exactly)
export interface Principal {
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
  provider: 'whatsapp' | 'legacy';
}

// Legacy interface for backward compatibility
export interface WhatsAppUser extends Principal {
  whatsappNumber: string;
}

interface AuthContextType {
  user: Principal | undefined;
  isLoading: boolean;
  error: any;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  role: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data, isLoading, isFetching, error } = useQuery<Principal | null>({
    queryKey: ["/api/auth/user"],
    retry: false,
    // Force fresh auth checks (no stale cache)
    staleTime: 0, // Always fresh
    gcTime: 1000,  // 1 second cache only
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchOnMount: true,
    refetchInterval: false,
  });

  const user = data ?? undefined;

  const value: AuthContextType = {
    user,
    isLoading: isLoading || isFetching,
    error,
    isAuthenticated: !!user,
    isSuperAdmin: Boolean(user?.isSuperAdmin),
    role: user?.role ?? "guest",
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

// Legacy hook for backward compatibility - now uses context
export function useWhatsAppAuth(): AuthContextType {
  return useAuthContext();
}