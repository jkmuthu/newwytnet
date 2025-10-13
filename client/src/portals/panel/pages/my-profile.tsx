import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { User, Save, Camera, Globe, Lock, Unlock, Check, Plus, Trash2, Edit2, Target, CheckCircle2, Circle } from "lucide-react";
import ProfilePhotoUpload from "@/components/ProfilePhotoUpload";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const personalFormSchema = z.object({
  profilePhoto: z.string().optional(),
  nickName: z.string().optional(),
  bio: z.string().optional(),
  mobileNumber: z.string().optional(),
  gender: z.string().optional(),
  dateOfBirth: z.string().optional(),
  maritalStatus: z.string().optional(),
  motherTongue: z.string().optional(),
  homeLocation: z.string().optional(),
  livingIn: z.string().optional(),
  country: z.string().optional(),
  languagesKnown: z.array(z.object({
    code: z.string(),
    name: z.string(),
    speak: z.boolean(),
    write: z.boolean(),
  })).optional(),
});

type PersonalFormValues = z.infer<typeof personalFormSchema>;

interface UserProfile extends PersonalFormValues {
  userId: string;
  privacySettings: Record<string, 'public' | 'private'>;
  profileCompletionPercentage: number;
}

interface DatasetItem {
  id: string;
  code: string;
  label: string;
  locale: string;
}

const bucketListSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  category: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  status: z.enum(['pending', 'in_progress', 'completed']).optional(),
  targetDate: z.string().optional(),
  isPublic: z.boolean().optional(),
});

type BucketListFormValues = z.infer<typeof bucketListSchema>;

interface BucketListItem {
  id: string;
  title: string;
  description?: string;
  category?: string;
  priority: string;
  status: string;
  targetDate?: string;
  completedAt?: string;
  isPublic: boolean;
  createdAt: string;
}

export default function MyProfile() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("bucket-list");
  const [privacySettings, setPrivacySettings] = useState<Record<string, 'public' | 'private'>>({});
  const [selectedLanguages, setSelectedLanguages] = useState<Array<{code: string; name: string; speak: boolean; write: boolean}>>([]);
  const [bucketDialogOpen, setBucketDialogOpen] = useState(false);
  const [editingBucket, setEditingBucket] = useState<BucketListItem | null>(null);

  // Fetch user profile
  const { data: profile, isLoading } = useQuery<UserProfile>({
    queryKey: ["/api/account/profile"],
  });

  // Fetch user's full name and email from user data
  const { data: userData } = useQuery<{ name: string; email: string }>({
    queryKey: ["/api/user"],
  });

  // Fetch dataset items for dropdowns
  const { data: countriesData } = useQuery<{ items: DatasetItem[] }>({
    queryKey: ["/api/datasets/countries"],
  });

  const { data: languagesData } = useQuery<{ items: DatasetItem[] }>({
    queryKey: ["/api/datasets/languages"],
  });

  const { data: genderData } = useQuery<{ items: DatasetItem[] }>({
    queryKey: ["/api/datasets/gender"],
  });

  const { data: maritalStatusData } = useQuery<{ items: DatasetItem[] }>({
    queryKey: ["/api/datasets/marital-status"],
  });

  // Bucket List queries and mutations
  const { data: bucketListData, isLoading: bucketLoading } = useQuery<{ items: BucketListItem[] }>({
    queryKey: ["/api/bucket-list"],
  });

  const bucketForm = useForm<BucketListFormValues>({
    resolver: zodResolver(bucketListSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      priority: "medium",
      status: "pending",
      targetDate: "",
      isPublic: true,
    },
  });

  const createBucketMutation = useMutation({
    mutationFn: async (data: BucketListFormValues) => {
      return await apiRequest("/api/bucket-list", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bucket-list"] });
      setBucketDialogOpen(false);
      bucketForm.reset();
      setEditingBucket(null);
      toast({ title: "Success", description: "Bucket list item added" });
    },
  });

  const updateBucketMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<BucketListFormValues> }) => {
      return await apiRequest(`/api/bucket-list/${id}`, "PATCH", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bucket-list"] });
      setBucketDialogOpen(false);
      bucketForm.reset();
      setEditingBucket(null);
      toast({ title: "Success", description: "Bucket list item updated" });
    },
  });

  const deleteBucketMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/bucket-list/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bucket-list"] });
      toast({ title: "Success", description: "Bucket list item deleted" });
    },
  });

  const handleEditBucket = (item: BucketListItem) => {
    setEditingBucket(item);
    bucketForm.reset({
      title: item.title,
      description: item.description || "",
      category: item.category || "",
      priority: item.priority as any,
      status: item.status as any,
      targetDate: item.targetDate || "",
      isPublic: item.isPublic,
    });
    setBucketDialogOpen(true);
  };

  const onBucketSubmit = (data: BucketListFormValues) => {
    if (editingBucket) {
      updateBucketMutation.mutate({ id: editingBucket.id, data });
    } else {
      createBucketMutation.mutate(data);
    }
  };

  const form = useForm<PersonalFormValues>({
    resolver: zodResolver(personalFormSchema),
    defaultValues: {
      profilePhoto: "",
      nickName: "",
      bio: "",
      mobileNumber: "",
      gender: "",
      dateOfBirth: "",
      maritalStatus: "",
      motherTongue: "Tamil",
      homeLocation: "",
      livingIn: "",
      country: "IN",
      languagesKnown: [],
    },
  });

  // Update form when profile data is loaded
  useEffect(() => {
    if (profile) {
      form.reset({
        profilePhoto: profile.profilePhoto || "",
        nickName: profile.nickName || "",
        bio: profile.bio || "",
        mobileNumber: profile.mobileNumber || "",
        gender: profile.gender || "",
        dateOfBirth: profile.dateOfBirth || "",
        maritalStatus: profile.maritalStatus || "",
        motherTongue: profile.motherTongue || "Tamil",
        homeLocation: profile.homeLocation || "",
        livingIn: profile.livingIn || "",
        country: profile.country || "IN",
        languagesKnown: profile.languagesKnown || [],
      });
      setPrivacySettings(profile.privacySettings || {});
      setSelectedLanguages(profile.languagesKnown || []);
    }
  }, [profile, form]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: PersonalFormValues & { privacySettings: Record<string, 'public' | 'private'> }) => {
      return await apiRequest("/api/account/profile", "PATCH", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/account/profile"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PersonalFormValues) => {
    // Validate D.O.B (minimum 18 years old)
    if (data.dateOfBirth) {
      const dob = new Date(data.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      
      if (age < 18 || (age === 18 && monthDiff < 0)) {
        toast({
          title: "Validation Error",
          description: "You must be at least 18 years old",
          variant: "destructive",
        });
        return;
      }
    }

    updateProfileMutation.mutate({
      ...data,
      languagesKnown: selectedLanguages,
      privacySettings,
    });
  };

  const togglePrivacy = (field: string) => {
    setPrivacySettings(prev => ({
      ...prev,
      [field]: prev[field] === 'private' ? 'public' : 'private'
    }));
  };

  const addLanguage = (code: string, name: string) => {
    if (!selectedLanguages.find(l => l.code === code)) {
      setSelectedLanguages([...selectedLanguages, { code, name, speak: false, write: false }]);
    }
  };

  const removeLanguage = (code: string) => {
    setSelectedLanguages(selectedLanguages.filter(l => l.code !== code));
  };

  const toggleLanguageSkill = (code: string, skill: 'speak' | 'write') => {
    setSelectedLanguages(selectedLanguages.map(lang =>
      lang.code === code ? { ...lang, [skill]: !lang[skill] } : lang
    ));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const completionPercentage = profile?.profileCompletionPercentage || 0;

  return (
    <div className="space-y-6">
      {/* Header with Completion */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Profile</h1>
            <p className="text-muted-foreground mt-2">Manage your personal information and settings</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary" data-testid="text-completion-percentage">
              {completionPercentage}% Completed
            </div>
            <p className="text-xs text-muted-foreground">Profile Strength</p>
          </div>
        </div>
        <div className="mt-4">
          <Progress value={completionPercentage} className="h-2" data-testid="progress-profile-completion" />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6" data-testid="tabs-profile">
          <TabsTrigger value="bucket-list" data-testid="tab-bucket-list">Bucket List</TabsTrigger>
          <TabsTrigger value="personal" data-testid="tab-personal">Personal</TabsTrigger>
          <TabsTrigger value="education" data-testid="tab-education">Education</TabsTrigger>
          <TabsTrigger value="works" data-testid="tab-works">Works</TabsTrigger>
          <TabsTrigger value="socials" data-testid="tab-socials">Socials</TabsTrigger>
          <TabsTrigger value="interests" data-testid="tab-interests">Interests</TabsTrigger>
        </TabsList>

        {/* Bucket List Tab */}
        <TabsContent value="bucket-list" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">My Bucket List</h2>
              <p className="text-muted-foreground">Add your goals and aspirations - your requirement is someone's opportunity!</p>
            </div>
            <Button onClick={() => { setBucketDialogOpen(true); setEditingBucket(null); bucketForm.reset(); }} data-testid="button-add-bucket">
              <Plus className="h-4 w-4 mr-2" />
              Add Goal
            </Button>
          </div>

          {bucketLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : bucketListData?.items && bucketListData.items.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bucketListData.items.map((item) => (
                <Card key={item.id} className="relative" data-testid={`card-bucket-${item.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {item.status === 'completed' ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : item.status === 'in_progress' ? (
                            <Circle className="h-5 w-5 text-blue-600" />
                          ) : (
                            <Target className="h-5 w-5 text-gray-400" />
                          )}
                          <CardTitle className="text-lg">{item.title}</CardTitle>
                        </div>
                        {item.description && (
                          <p className="text-sm text-muted-foreground mt-2">{item.description}</p>
                        )}
                        <div className="flex flex-wrap gap-2 mt-3">
                          {item.category && (
                            <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                              {item.category}
                            </span>
                          )}
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            item.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                            item.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                            'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                          }`}>
                            {item.priority}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            item.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                            item.status === 'in_progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                            'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                          }`}>
                            {item.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEditBucket(item)} data-testid={`button-edit-bucket-${item.id}`}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteBucketMutation.mutate(item.id)} data-testid={`button-delete-bucket-${item.id}`}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Target className="h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Bucket List Items</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Start adding your goals and aspirations. Your requirements might be someone else's opportunities!
                </p>
                <Button onClick={() => { setBucketDialogOpen(true); setEditingBucket(null); bucketForm.reset(); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Goal
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Bucket List Dialog */}
          <Dialog open={bucketDialogOpen} onOpenChange={setBucketDialogOpen}>
            <DialogContent data-testid="dialog-bucket-form">
              <DialogHeader>
                <DialogTitle>{editingBucket ? 'Edit Goal' : 'Add New Goal'}</DialogTitle>
                <DialogDescription>
                  Add goals and aspirations to your bucket list. Make them public to enable WytMatch matching!
                </DialogDescription>
              </DialogHeader>
              <Form {...bucketForm}>
                <form onSubmit={bucketForm.handleSubmit(onBucketSubmit)} className="space-y-4">
                  <FormField
                    control={bucketForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., Learn Spanish" data-testid="input-bucket-title" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={bucketForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Details about this goal..." data-testid="input-bucket-description" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={bucketForm.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., Travel, Learning" data-testid="input-bucket-category" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={bucketForm.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Priority</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-bucket-priority">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={bucketForm.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-bucket-status">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="in_progress">In Progress</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={bucketForm.control}
                      name="targetDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} data-testid="input-bucket-target-date" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={bucketForm.control}
                    name="isPublic"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                          <FormLabel>Public for WytMatch</FormLabel>
                          <FormDescription>
                            Allow others to see and match with this goal
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-bucket-public" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setBucketDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" data-testid="button-save-bucket">
                      {editingBucket ? 'Update' : 'Add'} Goal
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Personal Tab */}
        <TabsContent value="personal" className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Card data-testid="card-personal-info">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    <CardTitle>Personal Information</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Profile Photo */}
                  <ProfilePhotoUpload
                    currentPhoto={form.watch('profilePhoto')}
                    onPhotoChange={(url) => form.setValue('profilePhoto', url)}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Full Name - Read Only */}
                    <div className="space-y-2">
                      <Label>Full Name <span className="text-red-500">*</span></Label>
                      <Input 
                        value={userData?.name || ""} 
                        disabled 
                        className="bg-muted"
                        data-testid="input-full-name"
                      />
                      <p className="text-xs text-muted-foreground">Managed in My Account</p>
                    </div>

                    {/* Nick Name */}
                    <FormField
                      control={form.control}
                      name="nickName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nick Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Your nickname" 
                              data-testid="input-nick-name"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Bio */}
                    <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Bio</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Tell us about yourself"
                              className="resize-none"
                              rows={3}
                              data-testid="input-bio"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Email - Read Only with Privacy Toggle */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Email ID <span className="text-red-500">*</span></Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => togglePrivacy('email')}
                          data-testid="button-toggle-email-privacy"
                        >
                          {privacySettings.email === 'private' ? (
                            <><Lock className="h-3 w-3 mr-1" /> Private</>
                          ) : (
                            <><Unlock className="h-3 w-3 mr-1" /> Public</>
                          )}
                        </Button>
                      </div>
                      <Input 
                        value={userData?.email || ""} 
                        disabled 
                        className="bg-muted"
                        data-testid="input-email"
                      />
                      <p className="text-xs text-muted-foreground">Managed in My Account</p>
                    </div>

                    {/* Country */}
                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <select
                              {...field}
                              className="w-full border rounded-md px-3 py-2 dark:bg-gray-800"
                              data-testid="select-country"
                            >
                              {countriesData?.items?.map((country) => (
                                <option key={country.code} value={country.code}>
                                  {country.label}
                                </option>
                              ))}
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Mobile Number with Privacy */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Mobile Number <span className="text-red-500">*</span></Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => togglePrivacy('mobileNumber')}
                          data-testid="button-toggle-mobile-privacy"
                        >
                          {privacySettings.mobileNumber === 'private' ? (
                            <><Lock className="h-3 w-3 mr-1" /> Private</>
                          ) : (
                            <><Unlock className="h-3 w-3 mr-1" /> Public</>
                          )}
                        </Button>
                      </div>
                      <FormField
                        control={form.control}
                        name="mobileNumber"
                        render={({ field }) => (
                          <FormControl>
                            <Input 
                              placeholder="+91 98765 43210" 
                              data-testid="input-mobile-number"
                              {...field} 
                            />
                          </FormControl>
                        )}
                      />
                    </div>

                    {/* Gender with Privacy */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Gender <span className="text-red-500">*</span></Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => togglePrivacy('gender')}
                          data-testid="button-toggle-gender-privacy"
                        >
                          {privacySettings.gender === 'private' ? (
                            <><Lock className="h-3 w-3 mr-1" /> Private</>
                          ) : (
                            <><Unlock className="h-3 w-3 mr-1" /> Public</>
                          )}
                        </Button>
                      </div>
                      <FormField
                        control={form.control}
                        name="gender"
                        render={({ field }) => (
                          <FormControl>
                            <select
                              {...field}
                              className="w-full border rounded-md px-3 py-2 dark:bg-gray-800"
                              data-testid="select-gender"
                            >
                              <option value="">Select Gender</option>
                              {genderData?.items?.map((gender) => (
                                <option key={gender.code} value={gender.code}>
                                  {gender.label}
                                </option>
                              ))}
                            </select>
                          </FormControl>
                        )}
                      />
                    </div>

                    {/* Date of Birth with Privacy */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Date of Birth <span className="text-red-500">*</span></Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => togglePrivacy('dateOfBirth')}
                          data-testid="button-toggle-dob-privacy"
                        >
                          {privacySettings.dateOfBirth === 'private' ? (
                            <><Lock className="h-3 w-3 mr-1" /> Private</>
                          ) : (
                            <><Unlock className="h-3 w-3 mr-1" /> Public</>
                          )}
                        </Button>
                      </div>
                      <FormField
                        control={form.control}
                        name="dateOfBirth"
                        render={({ field }) => (
                          <FormControl>
                            <Input 
                              type="date" 
                              max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                              data-testid="input-date-of-birth"
                              {...field} 
                            />
                          </FormControl>
                        )}
                      />
                      <p className="text-xs text-muted-foreground">Must be at least 18 years old</p>
                    </div>

                    {/* Marital Status with Privacy */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Marital Status</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => togglePrivacy('maritalStatus')}
                          data-testid="button-toggle-marital-privacy"
                        >
                          {privacySettings.maritalStatus === 'private' ? (
                            <><Lock className="h-3 w-3 mr-1" /> Private</>
                          ) : (
                            <><Unlock className="h-3 w-3 mr-1" /> Public</>
                          )}
                        </Button>
                      </div>
                      <FormField
                        control={form.control}
                        name="maritalStatus"
                        render={({ field }) => (
                          <FormControl>
                            <select
                              {...field}
                              className="w-full border rounded-md px-3 py-2 dark:bg-gray-800"
                              data-testid="select-marital-status"
                            >
                              <option value="">Select Status</option>
                              {maritalStatusData?.items?.map((status) => (
                                <option key={status.code} value={status.code}>
                                  {status.label}
                                </option>
                              ))}
                            </select>
                          </FormControl>
                        )}
                      />
                    </div>

                    {/* Mother Tongue */}
                    <FormField
                      control={form.control}
                      name="motherTongue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mother Tongue</FormLabel>
                          <FormControl>
                            <select
                              {...field}
                              className="w-full border rounded-md px-3 py-2 dark:bg-gray-800"
                              data-testid="select-mother-tongue"
                            >
                              {languagesData?.items?.map((language) => (
                                <option key={language.code} value={language.code}>
                                  {language.label}
                                </option>
                              ))}
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Home Location with Privacy */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Home Location</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => togglePrivacy('homeLocation')}
                          data-testid="button-toggle-home-location-privacy"
                        >
                          {privacySettings.homeLocation === 'private' ? (
                            <><Lock className="h-3 w-3 mr-1" /> Private</>
                          ) : (
                            <><Unlock className="h-3 w-3 mr-1" /> Public</>
                          )}
                        </Button>
                      </div>
                      <FormField
                        control={form.control}
                        name="homeLocation"
                        render={({ field }) => (
                          <FormControl>
                            <Input 
                              placeholder="Your hometown" 
                              data-testid="input-home-location"
                              {...field} 
                            />
                          </FormControl>
                        )}
                      />
                    </div>

                    {/* Living In with Privacy */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Living In</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => togglePrivacy('livingIn')}
                          data-testid="button-toggle-living-in-privacy"
                        >
                          {privacySettings.livingIn === 'private' ? (
                            <><Lock className="h-3 w-3 mr-1" /> Private</>
                          ) : (
                            <><Unlock className="h-3 w-3 mr-1" /> Public</>
                          )}
                        </Button>
                      </div>
                      <FormField
                        control={form.control}
                        name="livingIn"
                        render={({ field }) => (
                          <FormControl>
                            <Input 
                              placeholder="Current city" 
                              data-testid="input-living-in"
                              {...field} 
                            />
                          </FormControl>
                        )}
                      />
                    </div>

                    {/* Languages Known with Speak/Write */}
                    <div className="md:col-span-2 space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Languages Known</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => togglePrivacy('languagesKnown')}
                          data-testid="button-toggle-languages-privacy"
                        >
                          {privacySettings.languagesKnown === 'private' ? (
                            <><Lock className="h-3 w-3 mr-1" /> Private</>
                          ) : (
                            <><Unlock className="h-3 w-3 mr-1" /> Public</>
                          )}
                        </Button>
                      </div>
                      
                      {/* Add Language Dropdown */}
                      <div className="flex gap-2">
                        <select
                          className="flex-1 border rounded-md px-3 py-2 dark:bg-gray-800"
                          onChange={(e) => {
                            const selected = languagesData?.items?.find(l => l.code === e.target.value);
                            if (selected) {
                              addLanguage(selected.code, selected.label);
                              e.target.value = "";
                            }
                          }}
                          data-testid="select-add-language"
                        >
                          <option value="">+ Add Language</option>
                          {languagesData?.items
                            ?.filter(lang => !selectedLanguages.find(l => l.code === lang.code))
                            .map((language) => (
                              <option key={language.code} value={language.code}>
                                {language.label}
                              </option>
                            ))}
                        </select>
                      </div>

                      {/* Selected Languages List */}
                      <div className="space-y-2">
                        {selectedLanguages.map((language) => (
                          <div
                            key={language.code}
                            className="flex items-center justify-between p-3 border rounded-lg dark:border-gray-700"
                            data-testid={`language-item-${language.code}`}
                          >
                            <div className="font-medium">{language.name}</div>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  id={`${language.code}-speak`}
                                  checked={language.speak}
                                  onChange={() => toggleLanguageSkill(language.code, 'speak')}
                                  className="rounded"
                                  data-testid={`checkbox-${language.code}-speak`}
                                />
                                <label htmlFor={`${language.code}-speak`} className="text-sm cursor-pointer">Speak</label>
                              </div>
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  id={`${language.code}-write`}
                                  checked={language.write}
                                  onChange={() => toggleLanguageSkill(language.code, 'write')}
                                  className="rounded"
                                  data-testid={`checkbox-${language.code}-write`}
                                />
                                <label htmlFor={`${language.code}-write`} className="text-sm cursor-pointer">Write</label>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeLanguage(language.code)}
                                data-testid={`button-remove-${language.code}`}
                              >
                                ×
                              </Button>
                            </div>
                          </div>
                        ))}
                        {selectedLanguages.length === 0 && (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            No languages added yet. Select from the dropdown above.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={updateProfileMutation.isPending}
                  data-testid="button-save-profile"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        </TabsContent>

        {/* Education Tab - Placeholder */}
        <TabsContent value="education" className="space-y-6">
          <Card>
            <CardContent className="py-20 text-center">
              <p className="text-muted-foreground">Education section coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Works Tab - Placeholder */}
        <TabsContent value="works" className="space-y-6">
          <Card>
            <CardContent className="py-20 text-center">
              <p className="text-muted-foreground">Works section coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Socials Tab - Placeholder */}
        <TabsContent value="socials" className="space-y-6">
          <Card>
            <CardContent className="py-20 text-center">
              <p className="text-muted-foreground">Social links section coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Interests Tab - Placeholder */}
        <TabsContent value="interests" className="space-y-6">
          <Card>
            <CardContent className="py-20 text-center">
              <p className="text-muted-foreground">Interests section coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
