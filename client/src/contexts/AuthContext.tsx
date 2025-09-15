import { createContext, useContext } from 'react';
import { UserAuthProvider, useUserAuth, type User } from './UserAuthContext';

// Legacy Principal interface for backward compatibility (matches original)
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
  provider: 'whatsapp' | 'legacy' | 'replit';
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

// AuthProvider wrapper that uses UserAuthContext internally
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <UserAuthProvider>
      <AuthContextWrapper>
        {children}
      </AuthContextWrapper>
    </UserAuthProvider>
  );
}

// Internal wrapper that provides the legacy interface
function AuthContextWrapper({ children }: { children: React.ReactNode }) {
  const { user, isLoading, error, isAuthenticated } = useUserAuth();

  // Convert User to Principal for backward compatibility
  const legacyUser: Principal | undefined = user ? {
    ...user,
    provider: user.provider as 'whatsapp' | 'legacy' | 'replit'
  } : undefined;

  const value: AuthContextType = {
    user: legacyUser,
    isLoading,
    error,
    isAuthenticated,
    isSuperAdmin: Boolean(legacyUser?.isSuperAdmin),
    role: legacyUser?.role ?? "guest",
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