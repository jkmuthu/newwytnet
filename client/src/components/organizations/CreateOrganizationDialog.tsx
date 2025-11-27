import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Upload, 
  MapPin, 
  Mail, 
  Globe, 
  X,
  Loader2,
  Search
} from "lucide-react";

const ORG_TYPES = [
  'Proprietorship',
  'Partnership', 
  'LLP',
  'Pvt Ltd',
  'Public Ltd',
  'Trust / NGO'
] as const;

const BUSINESS_TYPES = [
  'Manufacturer',
  'Retail Outlet',
  'Merchant / Trader',
  'Exporter',
  'Service Provider'
] as const;

const organizationFormSchema = z.object({
  name: z.string().min(1, "Organization name is required").max(50, "Max 50 characters"),
  description: z.string().max(200, "Max 200 characters").optional().or(z.literal('')),
  orgType: z.enum(ORG_TYPES, { required_error: "Please select organization type" }),
  businessTypes: z.array(z.enum(BUSINESS_TYPES)).min(1, "Select at least one business type"),
  location: z.string().min(1, "Location is required"),
  locationDetails: z.object({
    lat: z.number().optional(),
    lng: z.number().optional(),
    address: z.string().optional(),
    placeId: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    pincode: z.string().optional(),
  }).optional(),
  email: z.string().email("Valid email required"),
  website: z.string().url("Enter valid URL").optional().or(z.literal('')),
  logo: z.string().optional(),
});

type OrganizationFormData = z.infer<typeof organizationFormSchema>;

interface LocationSuggestion {
  eLoc: string;
  placeName: string;
  placeAddress: string;
  type: string;
  latitude?: number;
  longitude?: number;
}

interface CreateOrganizationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingOrg?: any;
}

export default function CreateOrganizationDialog({ 
  open, 
  onOpenChange,
  editingOrg
}: CreateOrganizationDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [locationSearch, setLocationSearch] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  
  const isEditing = !!editingOrg;

  const form = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationFormSchema),
    defaultValues: {
      name: "",
      description: "",
      orgType: undefined,
      businessTypes: [],
      location: "",
      locationDetails: {},
      email: "",
      website: "",
      logo: "",
    },
  });

  // Pre-fill with sample data or editing data
  useEffect(() => {
    if (open) {
      if (editingOrg) {
        form.reset({
          name: editingOrg.name || "",
          description: editingOrg.description || "",
          orgType: editingOrg.orgType || undefined,
          businessTypes: editingOrg.businessTypes || [],
          location: editingOrg.location || "",
          locationDetails: editingOrg.locationDetails || {},
          email: editingOrg.email || "",
          website: editingOrg.website || "",
          logo: editingOrg.logo || "",
        });
        setLocationSearch(editingOrg.location || "");
      } else {
        // Pre-fill with Kamalam Ventures sample data
        form.reset({
          name: "Kamalam Ventures",
          description: "A dynamic business enterprise focused on trading and services",
          orgType: "Proprietorship",
          businessTypes: ["Merchant / Trader", "Service Provider"],
          location: "Chennai, Tamil Nadu, India",
          locationDetails: {
            city: "Chennai",
            state: "Tamil Nadu",
            country: "India",
            pincode: "600001",
          },
          email: "contact@kalalamventures.com",
          website: "https://kalalamventures.com",
          logo: "",
        });
        setLocationSearch("Chennai, Tamil Nadu, India");
      }
    }
  }, [open, editingOrg, form]);

  // Mappls location search
  const searchLocation = async (query: string) => {
    if (query.length < 3) {
      setLocationSuggestions([]);
      return;
    }
    
    setIsSearching(true);
    try {
      const response = await fetch(`/api/mappls/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setLocationSuggestions(data.suggestedLocations || []);
      }
    } catch (error) {
      console.error("Location search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleLocationInputChange = (value: string) => {
    setLocationSearch(value);
    form.setValue("location", value);
    setShowSuggestions(true);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      searchLocation(value);
    }, 300);
  };

  const selectLocation = (suggestion: LocationSuggestion) => {
    const fullAddress = suggestion.placeAddress || suggestion.placeName;
    setLocationSearch(fullAddress);
    form.setValue("location", fullAddress);
    form.setValue("locationDetails", {
      placeId: suggestion.eLoc,
      address: fullAddress,
      lat: suggestion.latitude,
      lng: suggestion.longitude,
    });
    setShowSuggestions(false);
    setLocationSuggestions([]);
  };

  const createMutation = useMutation({
    mutationFn: async (data: OrganizationFormData) => {
      const endpoint = isEditing 
        ? `/api/user/organizations/${editingOrg.id}` 
        : '/api/user/organizations';
      const method = isEditing ? 'PUT' : 'POST';
      return apiRequest(endpoint, method, data);
    },
    onSuccess: () => {
      toast({
        title: isEditing ? "Organization Updated" : "Organization Created",
        description: isEditing 
          ? "Your organization has been updated successfully."
          : "Your organization has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user/organizations'] });
      onOpenChange(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save organization",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: OrganizationFormData) => {
    createMutation.mutate(data);
  };

  const toggleBusinessType = (type: typeof BUSINESS_TYPES[number]) => {
    const current = form.getValues("businessTypes");
    if (current.includes(type)) {
      form.setValue("businessTypes", current.filter(t => t !== type), { shouldValidate: true });
    } else {
      form.setValue("businessTypes", [...current, type], { shouldValidate: true });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {isEditing ? "Edit Organization" : "Create Organization"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                {form.watch("logo") ? (
                  <img 
                    src={form.watch("logo")} 
                    alt="Logo" 
                    className="h-16 w-16 object-cover rounded-lg"
                  />
                ) : (
                  <Building2 className="h-10 w-10" />
                )}
              </div>
              <div className="flex-1">
                <Label>Logo</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Square logo recommended. You can change this later.
                </p>
                <Button type="button" variant="outline" size="sm" disabled>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Logo
                </Button>
              </div>
            </div>

            {/* Organization Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization Name *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter organization name" 
                      maxLength={50}
                      {...field} 
                      data-testid="input-org-name"
                    />
                  </FormControl>
                  <FormDescription>
                    {field.value?.length || 0}/50 characters
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Short Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Short Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Brief description of your organization" 
                      maxLength={200}
                      rows={2}
                      {...field} 
                      data-testid="input-org-description"
                    />
                  </FormControl>
                  <FormDescription>
                    {field.value?.length || 0}/200 characters
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Organization Type */}
            <FormField
              control={form.control}
              name="orgType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization Type *</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger data-testid="select-org-type">
                        <SelectValue placeholder="Select organization type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ORG_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Business Types - Multi Select */}
            <FormField
              control={form.control}
              name="businessTypes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Types *</FormLabel>
                  <FormDescription>Select all that apply</FormDescription>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {BUSINESS_TYPES.map((type) => (
                      <div 
                        key={type} 
                        className={`flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                          field.value?.includes(type) 
                            ? 'bg-primary/10 border-primary' 
                            : 'hover:bg-muted'
                        }`}
                        onClick={() => toggleBusinessType(type)}
                        data-testid={`checkbox-${type.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        <Checkbox 
                          checked={field.value?.includes(type)}
                          onCheckedChange={() => toggleBusinessType(type)}
                        />
                        <Label className="cursor-pointer text-sm">{type}</Label>
                      </div>
                    ))}
                  </div>
                  {field.value?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {field.value.map((type) => (
                        <Badge key={type} variant="secondary" className="flex items-center gap-1">
                          {type}
                          <X 
                            className="h-3 w-3 cursor-pointer" 
                            onClick={() => toggleBusinessType(type)}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Location - Mappls Picker */}
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location *</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          placeholder="Search for location..."
                          value={locationSearch}
                          onChange={(e) => handleLocationInputChange(e.target.value)}
                          onFocus={() => setShowSuggestions(true)}
                          className="pl-10"
                          data-testid="input-org-location"
                        />
                        {isSearching && (
                          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                        )}
                      </div>
                    </FormControl>
                    
                    {/* Location Suggestions Dropdown */}
                    {showSuggestions && locationSuggestions.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-popover border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {locationSuggestions.map((suggestion, index) => (
                          <div
                            key={suggestion.eLoc || index}
                            className="p-3 hover:bg-muted cursor-pointer border-b last:border-b-0"
                            onClick={() => selectLocation(suggestion)}
                          >
                            <div className="font-medium text-sm">{suggestion.placeName}</div>
                            <div className="text-xs text-muted-foreground">{suggestion.placeAddress}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <FormDescription>
                    Start typing to search for your business location
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email ID *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        type="email"
                        placeholder="business@example.com"
                        className="pl-10"
                        {...field} 
                        data-testid="input-org-email"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Website */}
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        type="url"
                        placeholder="https://www.example.com"
                        className="pl-10"
                        {...field} 
                        data-testid="input-org-website"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createMutation.isPending}
                data-testid="button-submit"
              >
                {createMutation.isPending && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                {isEditing ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
