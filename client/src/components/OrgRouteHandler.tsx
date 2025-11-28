import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import PublicOrganizationPage from "@/pages/public-organization";
import PanelRouter from "@/portals/panel/PanelRouter";

interface OrgRouteHandlerProps {
  orgname: string;
  rest?: string;
}

export default function OrgRouteHandler({ orgname, rest }: OrgRouteHandlerProps) {
  const [, setLocation] = useLocation();

  const { data: authData, isLoading: authLoading } = useQuery<{ id: string } | null>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  const { data: orgData, isLoading: orgLoading, error } = useQuery<{ success: boolean; organization: any; isPrivate?: boolean }>({
    queryKey: ['/api/public/organizations', orgname],
    queryFn: async () => {
      const res = await fetch(`/api/public/organizations/${orgname}`);
      return res.json();
    },
    retry: false,
  });

  const isAuthenticated = !!authData?.id;
  const isPublicOrg = orgData?.success && orgData?.organization?.isPublic;
  const isPrivateOrg = !orgData?.success || !orgData?.organization?.isPublic;
  const orgExists = orgData?.organization;

  if (authLoading || orgLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-purple-600" />
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <PanelRouter />;
  }

  if (isPublicOrg && !rest) {
    return <PublicOrganizationPage orgSlug={orgname} />;
  }

  if (isPublicOrg && rest) {
    return <PublicOrganizationPage orgSlug={orgname} />;
  }

  return <PublicOrganizationPage orgSlug={orgname} />;
}
