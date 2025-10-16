import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Building, Eye, Users, Settings, Activity, Calendar, Globe, Mail, Phone, MapPin } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

interface Organization {
  id: string;
  displayId?: string;
  name: string;
  slug: string;
  status: 'active' | 'inactive' | 'trash';
  settings?: any;
  createdAt: string;
  industry?: string;
  employees?: number;
  website?: string;
  email?: string;
  phone?: string;
  location?: string;
  teamMembers?: number;
}

// Sample organizations data
const sampleOrganizations: Organization[] = [
  {
    id: '1',
    displayId: 'ORG-00001',
    name: 'TechCorp Solutions',
    slug: 'techcorp-solutions',
    status: 'active',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
    industry: 'Technology',
    employees: 250,
    website: 'https://techcorp.example.com',
    email: 'contact@techcorp.example.com',
    phone: '+1 234 567 8900',
    location: 'San Francisco, CA',
    teamMembers: 12
  },
  {
    id: '2',
    displayId: 'ORG-00002',
    name: 'Global Innovations Inc',
    slug: 'global-innovations',
    status: 'active',
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 days ago
    industry: 'Manufacturing',
    employees: 500,
    website: 'https://globalinnovations.example.com',
    email: 'hello@globalinnovations.example.com',
    phone: '+1 234 567 8901',
    location: 'New York, NY',
    teamMembers: 25
  },
  {
    id: '3',
    displayId: 'ORG-00003',
    name: 'Creative Agency Pro',
    slug: 'creative-agency-pro',
    status: 'active',
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days ago
    industry: 'Marketing',
    employees: 75,
    website: 'https://creativeagency.example.com',
    email: 'studio@creativeagency.example.com',
    phone: '+1 234 567 8902',
    location: 'Los Angeles, CA',
    teamMembers: 8
  },
  {
    id: '4',
    displayId: 'ORG-00004',
    name: 'FinTech Ventures',
    slug: 'fintech-ventures',
    status: 'inactive',
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days ago
    industry: 'Finance',
    employees: 150,
    website: 'https://fintechventures.example.com',
    email: 'info@fintechventures.example.com',
    phone: '+1 234 567 8903',
    location: 'Chicago, IL',
    teamMembers: 15
  },
  {
    id: '5',
    displayId: 'ORG-00005',
    name: 'HealthCare Plus',
    slug: 'healthcare-plus',
    status: 'active',
    createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(), // 120 days ago
    industry: 'Healthcare',
    employees: 300,
    website: 'https://healthcareplus.example.com',
    email: 'support@healthcareplus.example.com',
    phone: '+1 234 567 8904',
    location: 'Boston, MA',
    teamMembers: 20
  }
];

export default function AdminTenants() {
  const [orgStatusFilter, setOrgStatusFilter] = useState<'active' | 'inactive' | 'trash'>('active');
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [isOrgDetailOpen, setIsOrgDetailOpen] = useState(false);
  const { toast } = useToast();

  const { data: tenantsData, isLoading } = useQuery<{
    success: boolean;
    tenants: Organization[];
  }>({
    queryKey: ['/api/admin/tenants'],
    enabled: false, // Disable automatic fetching since we're using sample data
  });

  // Use sample data for now
  const organizations = sampleOrganizations;
  const filteredOrgs = organizations.filter(org => org.status === orgStatusFilter);

  const handleViewOrg = (org: Organization) => {
    setSelectedOrg(org);
    setIsOrgDetailOpen(true);
  };

  const getOrgInitials = (name: string) => {
    const words = name.split(' ');
    if (words.length >= 2) {
      return `${words[0][0]}${words[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Active</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">Inactive</Badge>;
      case 'trash':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Trash</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Organization Management</h1>
        <p className="text-muted-foreground">Manage all organizations and teams</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            All Organizations
            <Badge variant="secondary" className="ml-2">
              {organizations.length} total
            </Badge>
          </CardTitle>
          <CardDescription>View and manage all organizations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status Filter Tabs */}
          <Tabs value={orgStatusFilter} onValueChange={(value) => setOrgStatusFilter(value as any)} className="w-full">
            <TabsList>
              <TabsTrigger value="active" data-testid="tab-orgs-active">
                Active ({organizations.filter(o => o.status === 'active').length})
              </TabsTrigger>
              <TabsTrigger value="inactive" data-testid="tab-orgs-inactive">
                Inactive ({organizations.filter(o => o.status === 'inactive').length})
              </TabsTrigger>
              <TabsTrigger value="trash" data-testid="tab-orgs-trash">
                Trash ({organizations.filter(o => o.status === 'trash').length})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Organizations Table */}
          {filteredOrgs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No {orgStatusFilter} organizations found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Organization</TableHead>
                    <TableHead>Industry</TableHead>
                    <TableHead>Employees</TableHead>
                    <TableHead>Team Members</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrgs.map((org) => (
                    <TableRow key={org.id} data-testid={`row-org-${org.id}`}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-purple-600 text-white">
                              {getOrgInitials(org.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{org.name}</div>
                            <div className="text-sm text-muted-foreground font-mono">{org.displayId}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{org.industry}</Badge>
                      </TableCell>
                      <TableCell>{org.employees} employees</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{org.teamMembers}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(org.status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(org.createdAt), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewOrg(org)}
                          data-testid={`button-view-org-${org.id}`}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Organization Detail Modal */}
      <Dialog open={isOrgDetailOpen} onOpenChange={setIsOrgDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-purple-600 text-white">
                  {selectedOrg && getOrgInitials(selectedOrg.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  {selectedOrg?.name}
                  {selectedOrg?.displayId && (
                    <Badge variant="outline" className="font-mono">{selectedOrg.displayId}</Badge>
                  )}
                </div>
                <div className="text-sm font-normal text-muted-foreground">{selectedOrg?.slug}</div>
              </div>
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="overview" className="mt-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="team">Team</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Building className="h-4 w-4" />
                        <span>Industry</span>
                      </div>
                      <div className="font-medium">{selectedOrg?.industry}</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>Employees</span>
                      </div>
                      <div className="font-medium">{selectedOrg?.employees} employees</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Globe className="h-4 w-4" />
                        <span>Website</span>
                      </div>
                      <div className="font-medium text-sm break-all">
                        <a href={selectedOrg?.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {selectedOrg?.website}
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>Location</span>
                      </div>
                      <div className="font-medium">{selectedOrg?.location}</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span>Email</span>
                      </div>
                      <div className="font-medium text-sm">{selectedOrg?.email}</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>Phone</span>
                      </div>
                      <div className="font-medium">{selectedOrg?.phone}</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="team" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Team Members</span>
                    <Badge variant="secondary">{selectedOrg?.teamMembers} members</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>Team member management will be displayed here</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Organization Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Status</h3>
                      <p className="text-sm text-muted-foreground">Current organization status</p>
                    </div>
                    {selectedOrg && getStatusBadge(selectedOrg.status)}
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Created</h3>
                      <p className="text-sm text-muted-foreground">Organization creation date</p>
                    </div>
                    <div className="text-sm">
                      {selectedOrg?.createdAt && format(new Date(selectedOrg.createdAt), 'PPP')}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>No recent activity</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
