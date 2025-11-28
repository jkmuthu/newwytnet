import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Loader2, Building2, MapPin, Mail, Globe, Calendar, ArrowLeft, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import PublicHeader from "@/portals/public/PublicHeader";

interface PublicOrganization {
  id: string;
  displayId: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  orgType: string;
  businessTypes: string[];
  email: string;
  website?: string;
  location: string;
  isPublic: boolean;
  createdAt: string;
}

interface PublicOrganizationPageProps {
  orgSlug: string;
}

export default function PublicOrganizationPage({ orgSlug }: PublicOrganizationPageProps) {
  const [, setLocation] = useLocation();

  const { data, isLoading, error, isError } = useQuery<{ success: boolean; organization: PublicOrganization; error?: string; isPrivate?: boolean }>({
    queryKey: ['/api/public/organizations', orgSlug],
    queryFn: async () => {
      const res = await fetch(`/api/public/organizations/${orgSlug}`);
      const json = await res.json();
      if (!res.ok) {
        throw { status: res.status, ...json };
      }
      return json;
    },
    retry: false,
  });

  const org = data?.organization;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(w => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <PublicHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-purple-600" />
            <p className="mt-2 text-gray-600 dark:text-gray-400">Loading organization...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    const err = error as any;
    
    if (err?.isPrivate) {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <PublicHeader />
          <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="max-w-md mx-auto">
              <CardContent className="pt-6 text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="h-8 w-8 text-gray-500" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Private Organization</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  This organization is private. You need to be a member to view it.
                </p>
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" onClick={() => setLocation('/')}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Go Home
                  </Button>
                  <Button onClick={() => setLocation('/login')}>
                    Login
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <PublicHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6 text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-8 w-8 text-red-500" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Organization Not Found</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                The organization you're looking for doesn't exist or has been removed.
              </p>
              <Button variant="outline" onClick={() => setLocation('/')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!org) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PublicHeader />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 h-32 sm:h-40" />
          
          <CardHeader className="relative pt-0">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 sm:-mt-16">
              <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-white dark:border-gray-900 shadow-lg">
                {org.logo ? (
                  <AvatarImage src={org.logo} alt={org.name} />
                ) : null}
                <AvatarFallback className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                  {getInitials(org.name)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 pb-2">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <CardTitle className="text-2xl sm:text-3xl">{org.name}</CardTitle>
                  <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    <Building2 className="h-3 w-3 mr-1" />
                    {org.orgType}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  wytnet.com/o/{org.slug}
                </p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {org.description && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">About</h3>
                <p className="text-gray-700 dark:text-gray-300">{org.description}</p>
              </div>
            )}

            {org.businessTypes && org.businessTypes.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Business Type</h3>
                <div className="flex flex-wrap gap-2">
                  {org.businessTypes.map((type: string) => (
                    <Badge key={type} variant="outline">
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Location</h3>
                  <p className="text-gray-700 dark:text-gray-300">{org.location}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</h3>
                  <a href={`mailto:${org.email}`} className="text-purple-600 hover:underline">
                    {org.email}
                  </a>
                </div>
              </div>

              {org.website && (
                <div className="flex items-start gap-3">
                  <Globe className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Website</h3>
                    <a href={org.website} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">
                      {org.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Member Since</h3>
                  <p className="text-gray-700 dark:text-gray-300">{formatDate(org.createdAt)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Button variant="outline" onClick={() => setLocation('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </main>
    </div>
  );
}
