import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building2, 
  Users, 
  Plus, 
  Settings,
  ExternalLink,
  Crown,
  UserCheck,
  Briefcase
} from "lucide-react";

interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  memberCount?: number;
  role?: string;
  status?: string;
}

export default function MyOrgs() {
  const [activeTab, setActiveTab] = useState("owner");

  const { data: orgsData, isLoading } = useQuery({
    queryKey: ['/api/user/organizations'],
  });

  const allOrgs: Organization[] = (orgsData as any)?.organizations || [];
  const ownerOrgs = allOrgs.filter(org => org.role === 'owner' || org.role === 'admin');
  const assignedOrgs = allOrgs.filter(org => org.role !== 'owner' && org.role !== 'admin');

  const OrgCard = ({ org, isOwner }: { org: Organization; isOwner: boolean }) => (
    <Card className="hover:shadow-lg transition-shadow" data-testid={`card-org-${org.slug}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white shadow-md">
              {org.logo ? (
                <img src={org.logo} alt={org.name} className="h-8 w-8 rounded" />
              ) : (
                <Building2 className="h-6 w-6" />
              )}
            </div>
            <div>
              <CardTitle className="text-lg">{org.name}</CardTitle>
              <CardDescription className="text-sm">@{org.slug}</CardDescription>
            </div>
          </div>
          <Badge variant={isOwner ? "default" : "secondary"} className="flex items-center gap-1">
            {isOwner ? <Crown className="h-3 w-3" /> : <UserCheck className="h-3 w-3" />}
            {org.role || (isOwner ? 'Owner' : 'Member')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {org.description && (
          <p className="text-sm text-muted-foreground mb-4">{org.description}</p>
        )}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{org.memberCount || 1} members</span>
          </div>
          <Badge variant="outline">{org.status || 'Active'}</Badge>
        </div>
        <div className="flex gap-2">
          <Link href={`/o/${org.slug}`} className="flex-1">
            <Button className="w-full" variant="default" data-testid={`button-open-${org.slug}`}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Panel
            </Button>
          </Link>
          {isOwner && (
            <Link href={`/o/${org.slug}/settings`}>
              <Button variant="outline" data-testid={`button-settings-${org.slug}`}>
                <Settings className="h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const EmptyState = ({ title, description, icon: Icon }: { title: string; description: string; icon: any }) => (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="h-16 w-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
          <Icon className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
        <p className="text-gray-600 dark:text-gray-300 text-center max-w-md">{description}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Organizations</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Manage organizations you own or belong to
          </p>
        </div>
        <Button data-testid="button-create-org">
          <Plus className="h-4 w-4 mr-2" />
          Create Organization
        </Button>
      </div>

      <Tabs defaultValue="owner" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="owner" data-testid="tab-owner-orgs" className="flex items-center gap-2">
            <Crown className="h-4 w-4" />
            Owner Orgs ({ownerOrgs.length})
          </TabsTrigger>
          <TabsTrigger value="assigned" data-testid="tab-assigned-orgs" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Assigned Orgs ({assignedOrgs.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="owner" className="mt-6">
          {isLoading ? (
            <div className="grid md:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                      <div>
                        <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
                        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mt-1" />
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : ownerOrgs.length === 0 ? (
            <EmptyState 
              title="No Organizations Owned" 
              description="You don't own any organizations yet. Create one to start managing your team and projects."
              icon={Crown}
            />
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {ownerOrgs.map((org) => (
                <OrgCard key={org.id} org={org} isOwner={true} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="assigned" className="mt-6">
          {isLoading ? (
            <div className="grid md:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                      <div>
                        <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
                        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mt-1" />
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : assignedOrgs.length === 0 ? (
            <EmptyState 
              title="No Assigned Organizations" 
              description="You haven't been added to any organizations yet. Ask an organization admin to invite you."
              icon={Briefcase}
            />
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {assignedOrgs.map((org) => (
                <OrgCard key={org.id} org={org} isOwner={false} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
