import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    // Don't throw errors to avoid console logs for unauthenticated users
    throwOnError: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
