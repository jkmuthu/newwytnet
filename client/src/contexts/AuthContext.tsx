import { createContext, useContext } from 'react';
import { useQuery } from '@tanstack/react-query';

export interface WhatsAppUser {
  id: string;
  name: string;
  country: string;
  whatsappNumber: string;
  gender?: string;
  dateOfBirth?: string;
  role: string;
  isSuperAdmin: boolean;
  isVerified: boolean;
  lastLoginAt?: string;
}

interface AuthContextType {
  user: WhatsAppUser | undefined;
  isLoading: boolean;
  error: any;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  role: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data, isLoading, isFetching, error } = useQuery<WhatsAppUser | null>({
    queryKey: ["/api/auth/whatsapp/user"],
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