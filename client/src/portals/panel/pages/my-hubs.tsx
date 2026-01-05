import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { 
  Globe, 
  Users, 
  ExternalLink,
  Crown,
  UserCheck,
  Layout,
  Sparkles
} from "lucide-react";

interface Hub {
  id: string;
  name: string;
  slug: string;
  subdomain?: string;
  description?: string;
  logo?: string;
  status?: string;
  role?: string;
  memberCount?: number;
  category?: string;
}

export default function MyHubs() {
  const { data: hubsData, isLoading } = useQuery({
    queryKey: ['/api/user/hubs'],
  });

  const { data: publicHubsData, isLoading: publicLoading } = useQuery({
    queryKey: ['/api/platform-hubs/active'],
  });

  const myHubs: Hub[] = (hubsData as any)?.hubs || [];
  const activeHubs: Hub[] = (publicHubsData as any)?.hubs || [];
  
  const adminHubs = myHubs.filter(hub => hub.role === 'admin' || hub.role === 'owner');
  const memberHubs = myHubs.filter(hub => hub.role !== 'admin' && hub.role !== 'owner');

  const HubCard = ({ hub, isAdmin }: { hub: Hub; isAdmin: boolean }) => (
    <Card className="hover:shadow-lg transition-shadow" data-testid={`card-hub-${hub.slug}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-md">
              {hub.logo ? (
                <img src={hub.logo} alt={hub.name} className="h-10 w-10 rounded-lg object-cover" />
              ) : (
                <Globe className="h-7 w-7" />
              )}
            </div>
            <div>
              <CardTitle className="text-lg">{hub.name}</CardTitle>
              <CardDescription className="text-sm">{hub.subdomain || hub.slug}.wytnet.com</CardDescription>
            </div>
          </div>
          <Badge variant={isAdmin ? "default" : "secondary"} className="flex items-center gap-1">
            {isAdmin ? <Crown className="h-3 w-3" /> : <UserCheck className="h-3 w-3" />}
            {hub.role || (isAdmin ? 'Admin' : 'Member')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {hub.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{hub.description}</p>
        )}
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2 border-t">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{hub.memberCount || 0} members</span>
          </div>
          <Badge variant="outline" className="capitalize">{hub.status || 'Active'}</Badge>
        </div>
        
        <div className="flex gap-2">
          <Link href={`/h/${hub.slug}`} className="flex-1">
            <Button className="w-full" variant="default" data-testid={`button-open-${hub.slug}`}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Hub
            </Button>
          </Link>
          {isAdmin && (
            <Link href={`/${hub.slug}/admin`}>
              <Button variant="outline" data-testid={`button-admin-${hub.slug}`}>
                <Layout className="h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const DiscoverHubCard = ({ hub }: { hub: Hub }) => (
    <Card className="hover:shadow-lg transition-shadow" data-testid={`card-discover-${hub.slug}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-gradient-to-br from-gray-400 to-gray-600 rounded-xl flex items-center justify-center text-white">
              {hub.logo ? (
                <img src={hub.logo} alt={hub.name} className="h-8 w-8 rounded-lg object-cover" />
              ) : (
                <Globe className="h-6 w-6" />
              )}
            </div>
            <div>
              <CardTitle className="text-base">{hub.name}</CardTitle>
              <CardDescription className="text-xs">{hub.subdomain || hub.slug}.wytnet.com</CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {hub.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{hub.description}</p>
        )}
        <Link href={`/h/${hub.slug}`}>
          <Button className="w-full" variant="outline" size="sm" data-testid={`button-visit-${hub.slug}`}>
            <ExternalLink className="h-4 w-4 mr-2" />
            Visit Hub
          </Button>
        </Link>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Hubs</h1>
          <p className="text-muted-foreground">Manage and explore platform hubs you're part of</p>
        </div>
      </div>

      <Tabs defaultValue="my-hubs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="my-hubs" data-testid="tab-my-hubs">
            My Hubs ({myHubs.length})
          </TabsTrigger>
          <TabsTrigger value="discover" data-testid="tab-discover">
            <Sparkles className="h-4 w-4 mr-1" />
            Discover
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-hubs" className="space-y-6">
          {myHubs.length === 0 ? (
            <Card className="p-12 text-center">
              <Globe className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Hubs Yet</h3>
              <p className="text-muted-foreground mb-4">
                You haven't joined any hubs yet. Explore and join hubs to collaborate with communities.
              </p>
              <Link href="/wythubs">
                <Button>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Explore Hubs
                </Button>
              </Link>
            </Card>
          ) : (
            <>
              {adminHubs.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Crown className="h-5 w-5 text-yellow-500" />
                    Hubs I Manage ({adminHubs.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {adminHubs.map(hub => (
                      <HubCard key={hub.id} hub={hub} isAdmin={true} />
                    ))}
                  </div>
                </div>
              )}

              {memberHubs.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <UserCheck className="h-5 w-5 text-blue-500" />
                    Hubs I'm Member Of ({memberHubs.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {memberHubs.map(hub => (
                      <HubCard key={hub.id} hub={hub} isAdmin={false} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="discover" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Active Platform Hubs</h3>
          </div>
          
          {publicLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
          ) : activeHubs.length === 0 ? (
            <Card className="p-12 text-center">
              <Globe className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Hubs Available</h3>
              <p className="text-muted-foreground">
                Check back later for new hubs to explore.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {activeHubs.map(hub => (
                <DiscoverHubCard key={hub.id} hub={hub} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
