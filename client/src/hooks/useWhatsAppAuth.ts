import { useQuery } from "@tanstack/react-query";

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

export function useWhatsAppAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/whatsapp/user"],
    retry: false,
  });

  return {
    user: user as WhatsAppUser | undefined,
    isLoading,
    error,
    isAuthenticated: !!user,
    isSuperAdmin: user?.isSuperAdmin || false,
    role: user?.role || 'guest',
  };
}