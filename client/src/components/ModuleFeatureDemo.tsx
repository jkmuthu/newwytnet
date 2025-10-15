import { useIsModuleEnabled } from "@/hooks/useEnabledModules";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

interface ModuleFeatureDemoProps {
  moduleId: string;
  moduleName: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ModuleFeatureDemo({ 
  moduleId, 
  moduleName, 
  children,
  fallback 
}: ModuleFeatureDemoProps) {
  const { isEnabled, isLoading } = useIsModuleEnabled(moduleId, 'platform');

  if (isLoading) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          <span className="ml-2 text-sm text-gray-500">Checking module activation...</span>
        </CardContent>
      </Card>
    );
  }

  if (!isEnabled) {
    return fallback || (
      <Card className="border-dashed border-red-200 dark:border-red-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <XCircle className="h-5 w-5" />
            Module Not Activated
          </CardTitle>
          <CardDescription>
            The <code className="text-xs bg-red-50 dark:bg-red-950 px-1 py-0.5 rounded">{moduleName}</code> module is not activated on this platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Badge variant="outline" className="text-red-600 border-red-300">
            Module ID: {moduleId}
          </Badge>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="relative">
      <div className="absolute -top-2 -right-2 z-10">
        <Badge variant="default" className="bg-green-500 text-white">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Active
        </Badge>
      </div>
      {children}
    </div>
  );
}

export function ConditionalFeature({ 
  moduleId, 
  children, 
  fallback = null 
}: { 
  moduleId: string; 
  children: React.ReactNode; 
  fallback?: React.ReactNode 
}) {
  const { isEnabled, isLoading } = useIsModuleEnabled(moduleId, 'platform');

  if (isLoading) return null;
  if (!isEnabled) return <>{fallback}</>;
  
  return <>{children}</>;
}
