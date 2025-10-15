import { useQuery } from '@tanstack/react-query';

export type ModuleContext = 'platform' | 'hub' | 'app' | 'game';

interface UseEnabledModulesOptions {
  context: ModuleContext;
  contextId?: string;
}

interface EnabledModulesResponse {
  success: boolean;
  activations: Array<{
    id: string;
    moduleId: string;
    context: string;
    isActive: boolean;
    settings?: any;
    activatedAt?: string;
  }>;
  moduleIds: string[];
}

export function useEnabledModules(options: UseEnabledModulesOptions) {
  const { context, contextId } = options;

  const query = useQuery<EnabledModulesResponse>({
    queryKey: ['/api/modules/enabled', context, contextId].filter(Boolean),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (contextId) {
        params.append('contextId', contextId);
      }
      
      const url = `/api/modules/enabled/${context}${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch enabled modules: ${response.statusText}`);
      }
      
      return response.json();
    },
    enabled: context === 'platform' || (!!contextId && ['hub', 'app', 'game'].includes(context)),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const isModuleEnabled = (moduleId: string): boolean => {
    if (!query.data?.moduleIds) return false;
    return query.data.moduleIds.includes(moduleId);
  };

  const getModuleSettings = (moduleId: string): any => {
    if (!query.data?.activations) return null;
    const activation = query.data.activations.find(a => a.moduleId === moduleId);
    return activation?.settings || null;
  };

  return {
    enabledModules: query.data?.moduleIds || [],
    activations: query.data?.activations || [],
    isModuleEnabled,
    getModuleSettings,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch
  };
}

export function useIsModuleEnabled(moduleId: string, context: ModuleContext = 'platform', contextId?: string) {
  const { isModuleEnabled, isLoading } = useEnabledModules({ context, contextId });
  return {
    isEnabled: isModuleEnabled(moduleId),
    isLoading
  };
}
