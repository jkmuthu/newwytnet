import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Plus, Search, Upload, Download, Filter, BarChart } from "lucide-react";

interface Trademark {
  tmNumber: string;
  brandName?: string;
  brandImage?: string;
  classes?: number[];
  goodsServices?: string;
  applicationDate?: string;
  registrationDate?: string;
  status?: string;
  office?: string;
  owner?: string;
  ownerAddress?: string;
}

/**
 * Trademark Management - India
 * Dedicated admin interface for managing Indian trademarks
 * Primary identifier: TM Number (7-digit Application Number)
 */
export default function TrademarkManagement() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [officeFilter, setOfficeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(0);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const pageSize = 50;

  // Fetch trademarks
  const { data: trademarksData, isLoading } = useQuery({
    queryKey: ['/api/trademarks/search', currentPage, searchTerm, statusFilter, officeFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: pageSize.toString(),
        offset: (currentPage * pageSize).toString(),
      });
      
      if (searchTerm) {
        if (/^\d+$/.test(searchTerm)) {
          params.append('tmNumber', searchTerm);
        } else {
          params.append('brandName', searchTerm);
        }
      }
      
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (officeFilter !== 'all') params.append('office', officeFilter);

      const response = await fetch(`/api/trademarks/search?${params}`);
      if (!response.ok) throw new Error('Failed to fetch trademarks');
      return response.json();
    }
  });

  // Fetch statistics
  const { data: statsData } = useQuery({
    queryKey: ['/api/trademarks/stats'],
  });

  // Fetch Nice Classifications
  const { data: classesData } = useQuery({
    queryKey: ['/api/trademarks/classes'],
  });

  const trademarks = trademarksData?.trademarks || [];
  const stats: any = statsData?.stats || {};
  const niceClasses: any[] = classesData?.classes || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Trademark Management - India
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage Indian trademark database with 7-digit TM Numbers
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" data-testid="button-export">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-trademark">
                <Plus className="h-4 w-4 mr-2" />
                Add Trademark
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <AddTrademarkForm 
                onSuccess={() => {
                  setIsAddDialogOpen(false);
                  queryClient.invalidateQueries({ queryKey: ['/api/trademarks/search'] });
                }}
                niceClasses={niceClasses}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Trademarks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Registered
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.registered || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Offices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.offices || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by TM Number or Brand Name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-trademark"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48" data-testid="select-status-filter">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Filed">Filed</SelectItem>
                <SelectItem value="Examined">Examined</SelectItem>
                <SelectItem value="Accepted">Accepted</SelectItem>
                <SelectItem value="Registered">Registered</SelectItem>
                <SelectItem value="Objected">Objected</SelectItem>
                <SelectItem value="Opposed">Opposed</SelectItem>
                <SelectItem value="Abandoned">Abandoned</SelectItem>
              </SelectContent>
            </Select>
            <Select value={officeFilter} onValueChange={setOfficeFilter}>
              <SelectTrigger className="w-full md:w-48" data-testid="select-office-filter">
                <SelectValue placeholder="Filter by Office" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Offices</SelectItem>
                <SelectItem value="MUMBAI">MUMBAI</SelectItem>
                <SelectItem value="DELHI">DELHI</SelectItem>
                <SelectItem value="CHENNAI">CHENNAI</SelectItem>
                <SelectItem value="AHMEDABAD">AHMEDABAD</SelectItem>
                <SelectItem value="KOLKATA">KOLKATA</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Trademarks Table */}
      <Card>
        <CardHeader>
          <CardTitle>Trademark Records</CardTitle>
          <CardDescription>
            {trademarks.length} records found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
              <p className="text-gray-600 dark:text-gray-400 mt-4">Loading trademarks...</p>
            </div>
          ) : trademarks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">No trademarks found</p>
              <Button 
                className="mt-4" 
                variant="outline"
                onClick={() => setIsAddDialogOpen(true)}
                data-testid="button-add-first-trademark"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Trademark
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>TM Number</TableHead>
                    <TableHead>Brand Name</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Classes</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Office</TableHead>
                    <TableHead>Application Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trademarks.map((tm: Trademark) => (
                    <TableRow key={tm.tmNumber} data-testid={`row-trademark-${tm.tmNumber}`}>
                      <TableCell className="font-mono font-semibold">
                        {tm.tmNumber}
                      </TableCell>
                      <TableCell className="font-medium">
                        {tm.brandName || '-'}
                      </TableCell>
                      <TableCell>{tm.owner || '-'}</TableCell>
                      <TableCell>
                        {tm.classes && tm.classes.length > 0 ? (
                          <div className="flex gap-1 flex-wrap">
                            {tm.classes.slice(0, 3).map(cls => (
                              <Badge key={cls} variant="secondary" className="text-xs">
                                {cls}
                              </Badge>
                            ))}
                            {tm.classes.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{tm.classes.length - 3}
                              </Badge>
                            )}
                          </div>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(tm.status)}>
                          {tm.status || 'Unknown'}
                        </Badge>
                      </TableCell>
                      <TableCell>{tm.office || '-'}</TableCell>
                      <TableCell>
                        {tm.applicationDate ? new Date(tm.applicationDate).toLocaleDateString() : '-'}
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          data-testid={`button-view-${tm.tmNumber}`}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {trademarks.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Showing {currentPage * pageSize + 1} to {currentPage * pageSize + trademarks.length} of {stats.total || trademarks.length}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                  data-testid="button-prev-page"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => p + 1)}
                  disabled={trademarks.length < pageSize}
                  data-testid="button-next-page"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function AddTrademarkForm({ onSuccess, niceClasses }: { onSuccess: () => void; niceClasses: any[] }) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    tmNumber: '',
    brandName: '',
    owner: '',
    ownerAddress: '',
    office: '',
    status: 'Filed',
    classes: [] as number[],
    goodsServices: '',
    applicationDate: '',
    registrationDate: '',
  });
  const [isFetching, setIsFetching] = useState(false);
  const [isFetched, setIsFetched] = useState(false);

  // Fetch trademark details by TM Number from TMView
  const handleFetchDetails = async () => {
    if (!/^\d{7}$/.test(formData.tmNumber)) {
      toast({
        title: "Invalid TM Number",
        description: "Please enter a valid 7-digit TM Number",
        variant: "destructive",
      });
      return;
    }

    setIsFetching(true);
    try {
      const response = await fetch(`/api/admin/trademarks/fetch-tmview/${formData.tmNumber}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Trademark not found in TMView');
      }

      const data = await response.json();
      const tm = data.trademark;

      // Auto-populate form with fetched data from TMView
      setFormData({
        tmNumber: tm.tmNumber || formData.tmNumber,
        brandName: tm.brandName || '',
        owner: tm.owner || '',
        ownerAddress: tm.ownerAddress || '',
        office: tm.office || 'MUMBAI',
        status: tm.status || 'Filed',
        classes: tm.classes || [],
        goodsServices: tm.goodsServices || '',
        applicationDate: tm.applicationDate ? new Date(tm.applicationDate).toISOString().split('T')[0] : '',
        registrationDate: tm.registrationDate ? new Date(tm.registrationDate).toISOString().split('T')[0] : '',
      });

      setIsFetched(true);
      toast({
        title: "Success!",
        description: "Trademark details fetched from TMView successfully",
      });
    } catch (error) {
      toast({
        title: "Not Found",
        description: "Trademark not found in TMView. Please check the TM Number or add manually.",
        variant: "destructive",
      });
    } finally {
      setIsFetching(false);
    }
  };

  const addMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/admin/trademarks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add trademark');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Trademark added successfully",
      });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add trademark",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate TM Number (7 digits for India)
    if (!/^\d{7}$/.test(formData.tmNumber)) {
      toast({
        title: "Validation Error",
        description: "TM Number must be exactly 7 digits",
        variant: "destructive",
      });
      return;
    }

    addMutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle>Add New Trademark</DialogTitle>
        <DialogDescription>
          Enter the trademark details. TM Number must be 7 digits.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div>
          <Label htmlFor="tmNumber">TM Number (Application Number) *</Label>
          <div className="flex gap-2">
            <Input
              id="tmNumber"
              placeholder="1234567"
              value={formData.tmNumber}
              onChange={(e) => {
                setFormData({ ...formData, tmNumber: e.target.value });
                setIsFetched(false);
              }}
              required
              pattern="\d{7}"
              maxLength={7}
              data-testid="input-tm-number"
              className="flex-1"
            />
            <Button
              type="button"
              variant="secondary"
              onClick={handleFetchDetails}
              disabled={isFetching || formData.tmNumber.length !== 7}
              data-testid="button-fetch-details"
            >
              {isFetching ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Fetching...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Fetch
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {isFetched 
              ? "✓ Details fetched successfully. You can edit before saving." 
              : "Enter 7-digit TM Number and click Fetch to auto-fill all details"
            }
          </p>
        </div>

        <div>
          <Label htmlFor="brandName">Brand Name *</Label>
          <Input
            id="brandName"
            placeholder="Brand name or wordmark"
            value={formData.brandName}
            onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
            required
            data-testid="input-brand-name"
          />
        </div>

        <div>
          <Label htmlFor="owner">Owner/Proprietor *</Label>
          <Input
            id="owner"
            placeholder="Company or individual name"
            value={formData.owner}
            onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
            required
            data-testid="input-owner"
          />
        </div>

        <div>
          <Label htmlFor="ownerAddress">Owner Address</Label>
          <Textarea
            id="ownerAddress"
            placeholder="Complete address"
            value={formData.ownerAddress}
            onChange={(e) => setFormData({ ...formData, ownerAddress: e.target.value })}
            data-testid="input-owner-address"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="office">Trademark Office *</Label>
            <Select 
              value={formData.office} 
              onValueChange={(value) => setFormData({ ...formData, office: value })}
            >
              <SelectTrigger data-testid="select-office">
                <SelectValue placeholder="Select office" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MUMBAI">MUMBAI</SelectItem>
                <SelectItem value="DELHI">DELHI</SelectItem>
                <SelectItem value="CHENNAI">CHENNAI</SelectItem>
                <SelectItem value="AHMEDABAD">AHMEDABAD</SelectItem>
                <SelectItem value="KOLKATA">KOLKATA</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="status">Status *</Label>
            <Select 
              value={formData.status} 
              onValueChange={(value) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger data-testid="select-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Filed">Filed</SelectItem>
                <SelectItem value="Examined">Examined</SelectItem>
                <SelectItem value="Accepted">Accepted</SelectItem>
                <SelectItem value="Registered">Registered</SelectItem>
                <SelectItem value="Objected">Objected</SelectItem>
                <SelectItem value="Opposed">Opposed</SelectItem>
                <SelectItem value="Abandoned">Abandoned</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="goodsServices">Goods & Services Description</Label>
          <Textarea
            id="goodsServices"
            placeholder="Description of goods and services"
            value={formData.goodsServices}
            onChange={(e) => setFormData({ ...formData, goodsServices: e.target.value })}
            data-testid="input-goods-services"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="applicationDate">Application Date</Label>
            <Input
              id="applicationDate"
              type="date"
              value={formData.applicationDate}
              onChange={(e) => setFormData({ ...formData, applicationDate: e.target.value })}
              data-testid="input-application-date"
            />
          </div>

          <div>
            <Label htmlFor="registrationDate">Registration Date</Label>
            <Input
              id="registrationDate"
              type="date"
              value={formData.registrationDate}
              onChange={(e) => setFormData({ ...formData, registrationDate: e.target.value })}
              data-testid="input-registration-date"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onSuccess} data-testid="button-cancel">
          Cancel
        </Button>
        <Button type="submit" disabled={addMutation.isPending} data-testid="button-save-trademark">
          {addMutation.isPending ? 'Adding...' : 'Add Trademark'}
        </Button>
      </div>
    </form>
  );
}

function getStatusVariant(status?: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status?.toLowerCase()) {
    case 'registered':
      return 'default';
    case 'filed':
    case 'examined':
    case 'accepted':
      return 'secondary';
    case 'objected':
    case 'opposed':
    case 'abandoned':
      return 'destructive';
    default:
      return 'outline';
  }
}
