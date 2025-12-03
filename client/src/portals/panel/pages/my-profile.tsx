import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  User, Save, Camera, Globe, Lock, Unlock, Check, Plus, Trash2, Edit2, 
  Target, CheckCircle2, Circle, GraduationCap, Briefcase, Share2, Heart,
  Building2, Calendar, MapPin, ExternalLink, Star
} from "lucide-react";
import ProfilePhotoUpload from "@/components/ProfilePhotoUpload";
import MapplsLocationPicker from "@/components/MapplsLocationPicker";
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

// ========================================
// SCHEMAS
// ========================================

const personalFormSchema = z.object({
  profilePhoto: z.string().optional(),
  fullName: z.string().optional(),
  nickName: z.string().optional(),
  bio: z.string().optional(),
  mobileNumber: z.string().optional(),
  gender: z.string().optional(),
  dateOfBirth: z.string().optional(),
  maritalStatus: z.string().optional(),
  motherTongue: z.string().optional(),
  location: z.string().optional(),
  languagesKnown: z.array(z.object({
    code: z.string(),
    name: z.string(),
    speak: z.boolean(),
    write: z.boolean(),
  })).optional(),
});

type PersonalFormValues = z.infer<typeof personalFormSchema>;

const wishListSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be 100 characters or less"),
  description: z.string().max(200, "Description must be 200 characters or less").optional(),
  category: z.string().optional(),
  targetDate: z.string().refine((val) => {
    if (!val) return true;
    const selectedDate = new Date(val + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate >= today;
  }, { message: "Target date must be today or in the future" }).optional(),
  isDone: z.boolean().optional(),
  isPublic: z.boolean().optional(),
});

type WishListFormValues = z.infer<typeof wishListSchema>;

const educationSchema = z.object({
  institution: z.string().min(1, "Institution name is required"),
  degree: z.string().optional(),
  fieldOfStudy: z.string().optional(),
  startYear: z.coerce.number().int().min(1900).max(new Date().getFullYear() + 10).optional(),
  endYear: z.coerce.number().int().min(1900).max(new Date().getFullYear() + 10).optional().nullable(),
  isCurrent: z.boolean().optional(),
  grade: z.string().optional(),
  activities: z.string().optional(),
  description: z.string().optional(),
  location: z.string().optional(),
  country: z.string().optional(),
});

type EducationFormValues = z.infer<typeof educationSchema>;

const worksSchema = z.object({
  company: z.string().min(1, "Company name is required"),
  role: z.string().min(1, "Role is required"),
  employmentType: z.string().optional(),
  industry: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional().nullable(),
  isCurrent: z.boolean().optional(),
  location: z.string().optional(),
  country: z.string().optional(),
  description: z.string().optional(),
  skills: z.array(z.string()).optional(),
});

type WorksFormValues = z.infer<typeof worksSchema>;

const socialsSchema = z.object({
  platform: z.string().min(1, "Platform is required"),
  username: z.string().optional(),
  profileUrl: z.string().url("Please enter a valid URL"),
  isPublic: z.boolean().optional(),
});

type SocialsFormValues = z.infer<typeof socialsSchema>;

const interestsSchema = z.object({
  category: z.string().min(1, "Category is required"),
  interest: z.string().min(1, "Interest is required"),
  level: z.string().optional(),
  yearsOfExperience: z.coerce.number().int().min(0).max(100).optional(),
  description: z.string().optional(),
  isPublic: z.boolean().optional(),
});

type InterestsFormValues = z.infer<typeof interestsSchema>;

// ========================================
// INTERFACES
// ========================================

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
  metadata?: any;
}

interface WishListItem {
  id: string;
  title: string;
  description?: string;
  category?: string;
  targetDate?: string;
  isDone: boolean;
  isPublic: boolean;
  createdAt: string;
}

interface EducationItem {
  id: string;
  institution: string;
  degree?: string;
  fieldOfStudy?: string;
  startYear?: number;
  endYear?: number;
  isCurrent: boolean;
  grade?: string;
  activities?: string;
  description?: string;
  location?: string;
  country?: string;
}

interface WorksItem {
  id: string;
  company: string;
  role: string;
  employmentType?: string;
  industry?: string;
  startDate?: string;
  endDate?: string;
  isCurrent: boolean;
  location?: string;
  country?: string;
  description?: string;
  skills?: string[];
}

interface SocialsItem {
  id: string;
  platform: string;
  username?: string;
  profileUrl: string;
  isVerified: boolean;
  isPublic: boolean;
}

interface InterestsItem {
  id: string;
  category: string;
  interest: string;
  level?: string;
  yearsOfExperience?: number;
  description?: string;
  isPublic: boolean;
}

// ========================================
// STATIC DATA (fallbacks for datasets)
// ========================================

const degreeTypes = [
  { code: "high_school", label: "High School" },
  { code: "diploma", label: "Diploma" },
  { code: "bachelors", label: "Bachelor's Degree" },
  { code: "masters", label: "Master's Degree" },
  { code: "phd", label: "PhD / Doctorate" },
  { code: "postdoc", label: "Post-Doctoral" },
  { code: "certification", label: "Professional Certification" },
  { code: "associate", label: "Associate Degree" },
];

const employmentTypes = [
  { code: "full_time", label: "Full-time" },
  { code: "part_time", label: "Part-time" },
  { code: "contract", label: "Contract" },
  { code: "freelance", label: "Freelance" },
  { code: "internship", label: "Internship" },
  { code: "self_employed", label: "Self-employed" },
  { code: "volunteer", label: "Volunteer" },
];

const socialPlatforms = [
  { code: "linkedin", label: "LinkedIn", icon: "💼" },
  { code: "twitter", label: "Twitter / X", icon: "🐦" },
  { code: "instagram", label: "Instagram", icon: "📸" },
  { code: "facebook", label: "Facebook", icon: "👤" },
  { code: "youtube", label: "YouTube", icon: "🎥" },
  { code: "tiktok", label: "TikTok", icon: "🎵" },
  { code: "github", label: "GitHub", icon: "💻" },
  { code: "dribbble", label: "Dribbble", icon: "🎨" },
  { code: "behance", label: "Behance", icon: "🖼️" },
  { code: "medium", label: "Medium", icon: "📝" },
  { code: "pinterest", label: "Pinterest", icon: "📌" },
  { code: "snapchat", label: "Snapchat", icon: "👻" },
  { code: "telegram", label: "Telegram", icon: "✈️" },
  { code: "whatsapp", label: "WhatsApp", icon: "💬" },
  { code: "discord", label: "Discord", icon: "🎮" },
  { code: "twitch", label: "Twitch", icon: "🎮" },
  { code: "website", label: "Personal Website", icon: "🌐" },
  { code: "other", label: "Other", icon: "🔗" },
];

const interestCategories = [
  { code: "sports", label: "Sports & Fitness", icon: "⚽" },
  { code: "music", label: "Music", icon: "🎵" },
  { code: "art", label: "Art & Design", icon: "🎨" },
  { code: "travel", label: "Travel", icon: "✈️" },
  { code: "food", label: "Food & Cooking", icon: "🍳" },
  { code: "reading", label: "Reading & Writing", icon: "📚" },
  { code: "technology", label: "Technology", icon: "💻" },
  { code: "gaming", label: "Gaming", icon: "🎮" },
  { code: "photography", label: "Photography", icon: "📷" },
  { code: "movies", label: "Movies & TV", icon: "🎬" },
  { code: "nature", label: "Nature & Outdoors", icon: "🌿" },
  { code: "health", label: "Health & Wellness", icon: "🧘" },
  { code: "fashion", label: "Fashion", icon: "👗" },
  { code: "finance", label: "Finance & Investing", icon: "💰" },
  { code: "volunteering", label: "Volunteering", icon: "🤝" },
  { code: "pets", label: "Pets & Animals", icon: "🐕" },
  { code: "crafts", label: "DIY & Crafts", icon: "🔨" },
  { code: "languages", label: "Languages", icon: "🌍" },
  { code: "science", label: "Science", icon: "🔬" },
  { code: "other", label: "Other", icon: "✨" },
];

const skillLevels = [
  { code: "beginner", label: "Beginner" },
  { code: "intermediate", label: "Intermediate" },
  { code: "advanced", label: "Advanced" },
  { code: "expert", label: "Expert" },
];

const wishCategories = [
  { code: "travel", label: "Travel" },
  { code: "career", label: "Career" },
  { code: "learning", label: "Learning" },
  { code: "health", label: "Health & Fitness" },
  { code: "financial", label: "Financial" },
  { code: "personal", label: "Personal Growth" },
  { code: "relationship", label: "Relationships" },
  { code: "creative", label: "Creative" },
  { code: "adventure", label: "Adventure" },
  { code: "other", label: "Other" },
];

// ========================================
// MAIN COMPONENT
// ========================================

export default function MyProfile() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("wish-list");
  const [privacySettings, setPrivacySettings] = useState<Record<string, 'public' | 'private'>>({});
  const [selectedLanguages, setSelectedLanguages] = useState<Array<{code: string; name: string; speak: boolean; write: boolean}>>([]);
  
  // Dialog states
  const [wishDialogOpen, setWishDialogOpen] = useState(false);
  const [editingWish, setEditingWish] = useState<WishListItem | null>(null);
  
  const [educationDialogOpen, setEducationDialogOpen] = useState(false);
  const [editingEducation, setEditingEducation] = useState<EducationItem | null>(null);
  
  const [worksDialogOpen, setWorksDialogOpen] = useState(false);
  const [editingWorks, setEditingWorks] = useState<WorksItem | null>(null);
  
  const [socialsDialogOpen, setSocialsDialogOpen] = useState(false);
  const [editingSocials, setEditingSocials] = useState<SocialsItem | null>(null);
  
  const [interestsDialogOpen, setInterestsDialogOpen] = useState(false);
  const [editingInterests, setEditingInterests] = useState<InterestsItem | null>(null);

  // ========================================
  // QUERIES
  // ========================================

  const { data: profile, isLoading } = useQuery<UserProfile>({
    queryKey: ["/api/account/profile"],
  });

  const { data: userData } = useQuery<{ name: string; email: string }>({
    queryKey: ["/api/user"],
  });

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

  const { data: degreeTypesData } = useQuery<{ items: DatasetItem[] }>({
    queryKey: ["/api/datasets/degree-types"],
  });

  const { data: employmentTypesData } = useQuery<{ items: DatasetItem[] }>({
    queryKey: ["/api/datasets/employment-types"],
  });

  const { data: socialPlatformsData } = useQuery<{ items: DatasetItem[] }>({
    queryKey: ["/api/datasets/social-platforms"],
  });

  const { data: interestCategoriesData } = useQuery<{ items: DatasetItem[] }>({
    queryKey: ["/api/datasets/interest-categories"],
  });

  const { data: industriesData } = useQuery<{ items: DatasetItem[] }>({
    queryKey: ["/api/datasets/industries"],
  });

  const { data: wishListData, isLoading: wishLoading } = useQuery<{ items: WishListItem[] }>({
    queryKey: ["/api/wish-list"],
  });

  const { data: educationData, isLoading: educationLoading } = useQuery<{ items: EducationItem[] }>({
    queryKey: ["/api/user-education"],
  });

  const { data: worksData, isLoading: worksLoading } = useQuery<{ items: WorksItem[] }>({
    queryKey: ["/api/user-works"],
  });

  const { data: socialsData, isLoading: socialsLoading } = useQuery<{ items: SocialsItem[] }>({
    queryKey: ["/api/user-socials"],
  });

  const { data: interestsData, isLoading: interestsLoading } = useQuery<{ items: InterestsItem[] }>({
    queryKey: ["/api/user-interests"],
  });

  // ========================================
  // FORMS
  // ========================================

  const wishForm = useForm<WishListFormValues>({
    resolver: zodResolver(wishListSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      targetDate: "",
      isDone: false,
      isPublic: true,
    },
  });

  const educationForm = useForm<EducationFormValues>({
    resolver: zodResolver(educationSchema),
    defaultValues: {
      institution: "",
      degree: "",
      fieldOfStudy: "",
      startYear: undefined,
      endYear: undefined,
      isCurrent: false,
      grade: "",
      activities: "",
      description: "",
      location: "",
      country: "IN",
    },
  });

  const worksForm = useForm<WorksFormValues>({
    resolver: zodResolver(worksSchema),
    defaultValues: {
      company: "",
      role: "",
      employmentType: "",
      industry: "",
      startDate: "",
      endDate: "",
      isCurrent: false,
      location: "",
      country: "IN",
      description: "",
      skills: [],
    },
  });

  const socialsForm = useForm<SocialsFormValues>({
    resolver: zodResolver(socialsSchema),
    defaultValues: {
      platform: "",
      username: "",
      profileUrl: "",
      isPublic: true,
    },
  });

  const interestsForm = useForm<InterestsFormValues>({
    resolver: zodResolver(interestsSchema),
    defaultValues: {
      category: "",
      interest: "",
      level: "",
      yearsOfExperience: undefined,
      description: "",
      isPublic: true,
    },
  });

  const form = useForm<PersonalFormValues>({
    resolver: zodResolver(personalFormSchema),
    defaultValues: {
      profilePhoto: "",
      fullName: "",
      nickName: "",
      bio: "",
      mobileNumber: "",
      gender: "",
      dateOfBirth: "",
      maritalStatus: "",
      motherTongue: "Tamil",
      location: "",
      languagesKnown: [],
    },
  });

  // ========================================
  // MUTATIONS - WISH LIST
  // ========================================

  const createWishMutation = useMutation({
    mutationFn: async (data: WishListFormValues) => {
      return await apiRequest("/api/wish-list", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wish-list"] });
      setWishDialogOpen(false);
      wishForm.reset();
      setEditingWish(null);
      toast({ title: "Success", description: "Wish list item added" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateWishMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<WishListFormValues> }) => {
      return await apiRequest(`/api/wish-list/${id}`, "PATCH", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wish-list"] });
      setWishDialogOpen(false);
      wishForm.reset();
      setEditingWish(null);
      toast({ title: "Success", description: "Wish list item updated" });
    },
  });

  const deleteWishMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/wish-list/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wish-list"] });
      toast({ title: "Success", description: "Wish list item deleted" });
    },
  });

  // ========================================
  // MUTATIONS - EDUCATION
  // ========================================

  const createEducationMutation = useMutation({
    mutationFn: async (data: EducationFormValues) => {
      return await apiRequest("/api/user-education", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user-education"] });
      setEducationDialogOpen(false);
      educationForm.reset();
      setEditingEducation(null);
      toast({ title: "Success", description: "Education added" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateEducationMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<EducationFormValues> }) => {
      return await apiRequest(`/api/user-education/${id}`, "PATCH", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user-education"] });
      setEducationDialogOpen(false);
      educationForm.reset();
      setEditingEducation(null);
      toast({ title: "Success", description: "Education updated" });
    },
  });

  const deleteEducationMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/user-education/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user-education"] });
      toast({ title: "Success", description: "Education deleted" });
    },
  });

  // ========================================
  // MUTATIONS - WORKS
  // ========================================

  const createWorksMutation = useMutation({
    mutationFn: async (data: WorksFormValues) => {
      return await apiRequest("/api/user-works", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user-works"] });
      setWorksDialogOpen(false);
      worksForm.reset();
      setEditingWorks(null);
      toast({ title: "Success", description: "Work experience added" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateWorksMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<WorksFormValues> }) => {
      return await apiRequest(`/api/user-works/${id}`, "PATCH", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user-works"] });
      setWorksDialogOpen(false);
      worksForm.reset();
      setEditingWorks(null);
      toast({ title: "Success", description: "Work experience updated" });
    },
  });

  const deleteWorksMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/user-works/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user-works"] });
      toast({ title: "Success", description: "Work experience deleted" });
    },
  });

  // ========================================
  // MUTATIONS - SOCIALS
  // ========================================

  const createSocialsMutation = useMutation({
    mutationFn: async (data: SocialsFormValues) => {
      return await apiRequest("/api/user-socials", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user-socials"] });
      setSocialsDialogOpen(false);
      socialsForm.reset();
      setEditingSocials(null);
      toast({ title: "Success", description: "Social profile added" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateSocialsMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<SocialsFormValues> }) => {
      return await apiRequest(`/api/user-socials/${id}`, "PATCH", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user-socials"] });
      setSocialsDialogOpen(false);
      socialsForm.reset();
      setEditingSocials(null);
      toast({ title: "Success", description: "Social profile updated" });
    },
  });

  const deleteSocialsMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/user-socials/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user-socials"] });
      toast({ title: "Success", description: "Social profile deleted" });
    },
  });

  // ========================================
  // MUTATIONS - INTERESTS
  // ========================================

  const createInterestsMutation = useMutation({
    mutationFn: async (data: InterestsFormValues) => {
      return await apiRequest("/api/user-interests", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user-interests"] });
      setInterestsDialogOpen(false);
      interestsForm.reset();
      setEditingInterests(null);
      toast({ title: "Success", description: "Interest added" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateInterestsMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InterestsFormValues> }) => {
      return await apiRequest(`/api/user-interests/${id}`, "PATCH", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user-interests"] });
      setInterestsDialogOpen(false);
      interestsForm.reset();
      setEditingInterests(null);
      toast({ title: "Success", description: "Interest updated" });
    },
  });

  const deleteInterestsMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/user-interests/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user-interests"] });
      toast({ title: "Success", description: "Interest deleted" });
    },
  });

  // ========================================
  // MUTATIONS - PROFILE
  // ========================================

  const updateProfileMutation = useMutation({
    mutationFn: async (data: PersonalFormValues & { privacySettings: Record<string, 'public' | 'private'> }) => {
      return await apiRequest("/api/account/profile", "PATCH", data);
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Profile updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/account/profile"] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to update profile", variant: "destructive" });
    },
  });

  // ========================================
  // EFFECTS
  // ========================================

  useEffect(() => {
    if (profile) {
      form.reset({
        profilePhoto: profile.profilePhoto || "",
        fullName: (profile as any).fullName || "",
        nickName: profile.nickName || "",
        bio: profile.bio || "",
        mobileNumber: profile.mobileNumber || "",
        gender: profile.gender || "",
        dateOfBirth: profile.dateOfBirth || "",
        maritalStatus: profile.maritalStatus || "",
        motherTongue: profile.motherTongue || "Tamil",
        location: (profile as any).location || "",
        languagesKnown: profile.languagesKnown || [],
      });
      setPrivacySettings(profile.privacySettings || {});
      setSelectedLanguages(profile.languagesKnown || []);
    }
  }, [profile, form]);

  // ========================================
  // HANDLERS
  // ========================================

  const handleEditWish = (item: WishListItem) => {
    setEditingWish(item);
    wishForm.reset({
      title: item.title,
      description: item.description || "",
      category: item.category || "",
      targetDate: item.targetDate ? item.targetDate.split('T')[0] : "",
      isDone: item.isDone,
      isPublic: item.isPublic,
    });
    setWishDialogOpen(true);
  };

  const onWishSubmit = (data: WishListFormValues) => {
    if (editingWish) {
      updateWishMutation.mutate({ id: editingWish.id, data });
    } else {
      createWishMutation.mutate(data);
    }
  };

  const handleEditEducation = (item: EducationItem) => {
    setEditingEducation(item);
    educationForm.reset({
      institution: item.institution,
      degree: item.degree || "",
      fieldOfStudy: item.fieldOfStudy || "",
      startYear: item.startYear,
      endYear: item.endYear,
      isCurrent: item.isCurrent,
      grade: item.grade || "",
      activities: item.activities || "",
      description: item.description || "",
      location: item.location || "",
      country: item.country || "IN",
    });
    setEducationDialogOpen(true);
  };

  const onEducationSubmit = (data: EducationFormValues) => {
    if (editingEducation) {
      updateEducationMutation.mutate({ id: editingEducation.id, data });
    } else {
      createEducationMutation.mutate(data);
    }
  };

  const handleEditWorks = (item: WorksItem) => {
    setEditingWorks(item);
    worksForm.reset({
      company: item.company,
      role: item.role,
      employmentType: item.employmentType || "",
      industry: item.industry || "",
      startDate: item.startDate ? item.startDate.split('T')[0] : "",
      endDate: item.endDate ? item.endDate.split('T')[0] : "",
      isCurrent: item.isCurrent,
      location: item.location || "",
      country: item.country || "IN",
      description: item.description || "",
      skills: item.skills || [],
    });
    setWorksDialogOpen(true);
  };

  const onWorksSubmit = (data: WorksFormValues) => {
    if (editingWorks) {
      updateWorksMutation.mutate({ id: editingWorks.id, data });
    } else {
      createWorksMutation.mutate(data);
    }
  };

  const handleEditSocials = (item: SocialsItem) => {
    setEditingSocials(item);
    socialsForm.reset({
      platform: item.platform,
      username: item.username || "",
      profileUrl: item.profileUrl,
      isPublic: item.isPublic,
    });
    setSocialsDialogOpen(true);
  };

  const onSocialsSubmit = (data: SocialsFormValues) => {
    if (editingSocials) {
      updateSocialsMutation.mutate({ id: editingSocials.id, data });
    } else {
      createSocialsMutation.mutate(data);
    }
  };

  const handleEditInterests = (item: InterestsItem) => {
    setEditingInterests(item);
    interestsForm.reset({
      category: item.category,
      interest: item.interest,
      level: item.level || "",
      yearsOfExperience: item.yearsOfExperience,
      description: item.description || "",
      isPublic: item.isPublic,
    });
    setInterestsDialogOpen(true);
  };

  const onInterestsSubmit = (data: InterestsFormValues) => {
    if (editingInterests) {
      updateInterestsMutation.mutate({ id: editingInterests.id, data });
    } else {
      createInterestsMutation.mutate(data);
    }
  };

  const onSubmit = (data: PersonalFormValues) => {
    if (data.dateOfBirth) {
      const dob = new Date(data.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      
      if (age < 18 || (age === 18 && monthDiff < 0)) {
        toast({ title: "Validation Error", description: "You must be at least 18 years old", variant: "destructive" });
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

  // ========================================
  // HELPER FUNCTIONS
  // ========================================

  const getDegreeLabel = (code: string) => {
    const item = degreeTypesData?.items?.find(i => i.code === code) || degreeTypes.find(i => i.code === code);
    return item?.label || code;
  };

  const getEmploymentTypeLabel = (code: string) => {
    const item = employmentTypesData?.items?.find(i => i.code === code) || employmentTypes.find(i => i.code === code);
    return item?.label || code;
  };

  const getSocialPlatform = (code: string): { code: string; label: string; icon: string } => {
    const datasetItem = socialPlatformsData?.items?.find(i => i.code === code);
    if (datasetItem) {
      return { code: datasetItem.code, label: datasetItem.label, icon: (datasetItem.metadata as any)?.icon || "🔗" };
    }
    const staticItem = socialPlatforms.find(i => i.code === code);
    return staticItem || { code, label: code, icon: "🔗" };
  };

  const getInterestCategory = (code: string): { code: string; label: string; icon: string } => {
    const datasetItem = interestCategoriesData?.items?.find(i => i.code === code);
    if (datasetItem) {
      return { code: datasetItem.code, label: datasetItem.label, icon: (datasetItem.metadata as any)?.icon || "✨" };
    }
    const staticItem = interestCategories.find(i => i.code === code);
    return staticItem || { code, label: code, icon: "✨" };
  };

  const getIndustryLabel = (code: string) => {
    const item = industriesData?.items?.find(i => i.code === code);
    return item?.label || code;
  };

  // ========================================
  // RENDER
  // ========================================

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
          <TabsTrigger value="wish-list" data-testid="tab-wish-list">Wish List</TabsTrigger>
          <TabsTrigger value="personal" data-testid="tab-personal">Personal</TabsTrigger>
          <TabsTrigger value="education" data-testid="tab-education">Education</TabsTrigger>
          <TabsTrigger value="works" data-testid="tab-works">Works</TabsTrigger>
          <TabsTrigger value="socials" data-testid="tab-socials">Socials</TabsTrigger>
          <TabsTrigger value="interests" data-testid="tab-interests">Interests</TabsTrigger>
        </TabsList>

        {/* ========================================
            WISH LIST TAB
        ======================================== */}
        <TabsContent value="wish-list" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">My Wish List</h2>
              <p className="text-muted-foreground">Add your goals and aspirations - your wish is someone's opportunity!</p>
            </div>
            <Button onClick={() => { setWishDialogOpen(true); setEditingWish(null); wishForm.reset(); }} data-testid="button-add-wish">
              <Plus className="h-4 w-4 mr-2" />
              Add Wish
            </Button>
          </div>

          {wishLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : wishListData?.items && wishListData.items.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {wishListData.items.map((item) => (
                <Card key={item.id} className="relative" data-testid={`card-wish-${item.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {item.isDone ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : (
                            <Target className="h-5 w-5 text-gray-400" />
                          )}
                          <CardTitle className={`text-lg ${item.isDone ? 'line-through text-muted-foreground' : ''}`}>
                            {item.title}
                          </CardTitle>
                        </div>
                        {item.description && (
                          <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                        )}
                        <div className="flex flex-wrap gap-2">
                          {item.category && (
                            <Badge variant="secondary">{item.category}</Badge>
                          )}
                          {item.targetDate && (
                            <Badge variant="outline">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(item.targetDate).toLocaleDateString()}
                            </Badge>
                          )}
                          {item.isPublic ? (
                            <Badge variant="outline" className="text-green-600">
                              <Globe className="h-3 w-3 mr-1" />
                              Public
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-gray-500">
                              <Lock className="h-3 w-3 mr-1" />
                              Private
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEditWish(item)} data-testid={`button-edit-wish-${item.id}`}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteWishMutation.mutate(item.id)} data-testid={`button-delete-wish-${item.id}`}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No wishes yet</h3>
                <p className="text-muted-foreground mb-4">Add your goals and aspirations to get started</p>
                <Button onClick={() => { setWishDialogOpen(true); setEditingWish(null); wishForm.reset(); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Wish
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Wish List Dialog */}
          <Dialog open={wishDialogOpen} onOpenChange={setWishDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingWish ? 'Edit Wish' : 'Add New Wish'}</DialogTitle>
                <DialogDescription>
                  {editingWish ? 'Update your wish details' : 'Add a new goal or aspiration to your wish list'}
                </DialogDescription>
              </DialogHeader>
              <Form {...wishForm}>
                <form onSubmit={wishForm.handleSubmit(onWishSubmit)} className="space-y-4">
                  <FormField
                    control={wishForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Learn to play guitar" {...field} data-testid="input-wish-title" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={wishForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Describe your wish..." {...field} data-testid="input-wish-description" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={wishForm.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-wish-category">
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {wishCategories.map((cat) => (
                                <SelectItem key={cat.code} value={cat.code}>{cat.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={wishForm.control}
                      name="targetDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} data-testid="input-wish-target-date" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex gap-4">
                    <FormField
                      control={wishForm.control}
                      name="isDone"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-2">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} data-testid="checkbox-wish-done" />
                          </FormControl>
                          <FormLabel className="!mt-0">Completed</FormLabel>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={wishForm.control}
                      name="isPublic"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-2">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} data-testid="checkbox-wish-public" />
                          </FormControl>
                          <FormLabel className="!mt-0">Public (visible to others)</FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setWishDialogOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={createWishMutation.isPending || updateWishMutation.isPending} data-testid="button-save-wish">
                      {(createWishMutation.isPending || updateWishMutation.isPending) ? 'Saving...' : 'Save'}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* ========================================
            PERSONAL TAB
        ======================================== */}
        <TabsContent value="personal" className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Profile Photo Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5" />
                    Profile Photo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ProfilePhotoUpload
                    currentPhoto={form.watch("profilePhoto") || ""}
                    onPhotoChange={(url) => form.setValue("profilePhoto", url)}
                  />
                </CardContent>
              </Card>

              {/* Basic Info Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center justify-between">
                            <FormLabel>Full Name</FormLabel>
                            <Button type="button" variant="ghost" size="sm" onClick={() => togglePrivacy('fullName')}>
                              {privacySettings.fullName === 'private' ? <Lock className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
                            </Button>
                          </div>
                          <FormControl>
                            <Input placeholder="Your full name" {...field} data-testid="input-fullname" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="nickName"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center justify-between">
                            <FormLabel>Nickname</FormLabel>
                            <Button type="button" variant="ghost" size="sm" onClick={() => togglePrivacy('nickName')}>
                              {privacySettings.nickName === 'private' ? <Lock className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
                            </Button>
                          </div>
                          <FormControl>
                            <Input placeholder="Your nickname" {...field} data-testid="input-nickname" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="mobileNumber"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center justify-between">
                            <FormLabel>Mobile Number</FormLabel>
                            <Button type="button" variant="ghost" size="sm" onClick={() => togglePrivacy('mobileNumber')}>
                              {privacySettings.mobileNumber === 'private' ? <Lock className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
                            </Button>
                          </div>
                          <FormControl>
                            <Input placeholder="+91 98765 43210" {...field} data-testid="input-mobile" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center justify-between">
                            <FormLabel>Location</FormLabel>
                            <Button type="button" variant="ghost" size="sm" onClick={() => togglePrivacy('location')}>
                              {privacySettings.location === 'private' ? <Lock className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
                            </Button>
                          </div>
                          <FormControl>
                            <MapplsLocationPicker
                              value={field.value || ""}
                              onChange={field.onChange}
                              placeholder="Search for your location..."
                              data-testid="input-location"
                            />
                          </FormControl>
                          <FormDescription>
                            Start typing to search for cities, towns, or areas
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Tell us about yourself..." {...field} data-testid="input-bio" />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gender</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-gender">
                                <SelectValue placeholder="Select gender" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {(genderData?.items || [
                                { code: 'male', label: 'Male' },
                                { code: 'female', label: 'Female' },
                                { code: 'other', label: 'Other' },
                                { code: 'prefer_not_to_say', label: 'Prefer not to say' },
                              ]).map((item) => (
                                <SelectItem key={item.code} value={item.code}>{item.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="dateOfBirth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date of Birth</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} data-testid="input-dob" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="maritalStatus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Marital Status</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-marital-status">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {(maritalStatusData?.items || [
                                { code: 'single', label: 'Single' },
                                { code: 'married', label: 'Married' },
                                { code: 'divorced', label: 'Divorced' },
                                { code: 'widowed', label: 'Widowed' },
                              ]).map((item) => (
                                <SelectItem key={item.code} value={item.code}>{item.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="motherTongue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mother Tongue</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-mother-tongue">
                              <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {(languagesData?.items || [
                              { code: 'Tamil', label: 'Tamil' },
                              { code: 'English', label: 'English' },
                              { code: 'Hindi', label: 'Hindi' },
                            ]).map((item) => (
                              <SelectItem key={item.code} value={item.code}>{item.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Languages Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Languages Known
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Add Language</Label>
                    <Select onValueChange={(value) => {
                      const lang = languagesData?.items?.find(l => l.code === value);
                      if (lang) addLanguage(lang.code, lang.label);
                    }}>
                      <SelectTrigger data-testid="select-add-language">
                        <SelectValue placeholder="Select a language to add" />
                      </SelectTrigger>
                      <SelectContent>
                        {(languagesData?.items || [
                          { code: 'en', label: 'English' },
                          { code: 'ta', label: 'Tamil' },
                          { code: 'hi', label: 'Hindi' },
                        ]).filter(l => !selectedLanguages.find(sl => sl.code === l.code)).map((lang) => (
                          <SelectItem key={lang.code} value={lang.code}>{lang.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    {selectedLanguages.map((lang) => (
                      <div key={lang.code} className="flex items-center justify-between p-3 border rounded-lg">
                        <span className="font-medium">{lang.name}</span>
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2">
                            <Checkbox
                              checked={lang.speak}
                              onCheckedChange={() => toggleLanguageSkill(lang.code, 'speak')}
                            />
                            <span className="text-sm">Speak</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <Checkbox
                              checked={lang.write}
                              onCheckedChange={() => toggleLanguageSkill(lang.code, 'write')}
                            />
                            <span className="text-sm">Write</span>
                          </label>
                          <Button type="button" variant="ghost" size="sm" onClick={() => removeLanguage(lang.code)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
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
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button type="submit" disabled={updateProfileMutation.isPending} data-testid="button-save-profile">
                  <Save className="h-4 w-4 mr-2" />
                  {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        </TabsContent>

        {/* ========================================
            EDUCATION TAB
        ======================================== */}
        <TabsContent value="education" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Education</h2>
              <p className="text-muted-foreground">Add your educational background</p>
            </div>
            <Button onClick={() => { setEducationDialogOpen(true); setEditingEducation(null); educationForm.reset(); }} data-testid="button-add-education">
              <Plus className="h-4 w-4 mr-2" />
              Add Education
            </Button>
          </div>

          {educationLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : educationData?.items && educationData.items.length > 0 ? (
            <div className="space-y-4">
              {educationData.items.map((item) => (
                <Card key={item.id} data-testid={`card-education-${item.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <GraduationCap className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{item.institution}</CardTitle>
                          <CardDescription>
                            {item.degree && getDegreeLabel(item.degree)}
                            {item.fieldOfStudy && ` in ${item.fieldOfStudy}`}
                          </CardDescription>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {(item.startYear || item.endYear) && (
                              <Badge variant="outline">
                                <Calendar className="h-3 w-3 mr-1" />
                                {item.startYear} - {item.isCurrent ? 'Present' : item.endYear}
                              </Badge>
                            )}
                            {item.grade && (
                              <Badge variant="secondary">{item.grade}</Badge>
                            )}
                            {item.location && (
                              <Badge variant="outline">
                                <MapPin className="h-3 w-3 mr-1" />
                                {item.location}
                              </Badge>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-sm text-muted-foreground mt-2">{item.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEditEducation(item)} data-testid={`button-edit-education-${item.id}`}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteEducationMutation.mutate(item.id)} data-testid={`button-delete-education-${item.id}`}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No education added yet</h3>
                <p className="text-muted-foreground mb-4">Add your educational background to complete your profile</p>
                <Button onClick={() => { setEducationDialogOpen(true); setEditingEducation(null); educationForm.reset(); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Education
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Education Dialog */}
          <Dialog open={educationDialogOpen} onOpenChange={setEducationDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingEducation ? 'Edit Education' : 'Add Education'}</DialogTitle>
              </DialogHeader>
              <Form {...educationForm}>
                <form onSubmit={educationForm.handleSubmit(onEducationSubmit)} className="space-y-4">
                  <FormField
                    control={educationForm.control}
                    name="institution"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Institution *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Harvard University" {...field} data-testid="input-education-institution" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={educationForm.control}
                      name="degree"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Degree</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-education-degree">
                                <SelectValue placeholder="Select degree" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {(degreeTypesData?.items || degreeTypes).map((item) => (
                                <SelectItem key={item.code} value={item.code}>{item.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={educationForm.control}
                      name="fieldOfStudy"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Field of Study</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Computer Science" {...field} data-testid="input-education-field" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={educationForm.control}
                      name="startYear"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Year</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="2018" {...field} data-testid="input-education-start-year" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={educationForm.control}
                      name="endYear"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Year</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="2022" disabled={educationForm.watch('isCurrent')} {...field} value={field.value || ''} data-testid="input-education-end-year" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={educationForm.control}
                      name="isCurrent"
                      render={({ field }) => (
                        <FormItem className="flex items-end gap-2 pb-2">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} data-testid="checkbox-education-current" />
                          </FormControl>
                          <FormLabel className="!mt-0">Currently studying</FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={educationForm.control}
                      name="grade"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Grade / CGPA</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., First Class, 3.8 GPA" {...field} data-testid="input-education-grade" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={educationForm.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input placeholder="City, State" {...field} data-testid="input-education-location" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={educationForm.control}
                    name="activities"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Activities & Societies</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Sports clubs, societies, achievements..." {...field} data-testid="input-education-activities" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={educationForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Additional details about your education..." {...field} data-testid="input-education-description" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setEducationDialogOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={createEducationMutation.isPending || updateEducationMutation.isPending} data-testid="button-save-education">
                      {(createEducationMutation.isPending || updateEducationMutation.isPending) ? 'Saving...' : 'Save'}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* ========================================
            WORKS TAB
        ======================================== */}
        <TabsContent value="works" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Work Experience</h2>
              <p className="text-muted-foreground">Add your professional experience</p>
            </div>
            <Button onClick={() => { setWorksDialogOpen(true); setEditingWorks(null); worksForm.reset(); }} data-testid="button-add-works">
              <Plus className="h-4 w-4 mr-2" />
              Add Experience
            </Button>
          </div>

          {worksLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : worksData?.items && worksData.items.length > 0 ? (
            <div className="space-y-4">
              {worksData.items.map((item) => (
                <Card key={item.id} data-testid={`card-works-${item.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Briefcase className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{item.role}</CardTitle>
                          <CardDescription className="flex items-center gap-1">
                            <Building2 className="h-4 w-4" />
                            {item.company}
                          </CardDescription>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {item.employmentType && (
                              <Badge variant="secondary">{getEmploymentTypeLabel(item.employmentType)}</Badge>
                            )}
                            {(item.startDate || item.endDate) && (
                              <Badge variant="outline">
                                <Calendar className="h-3 w-3 mr-1" />
                                {item.startDate && new Date(item.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                {' - '}
                                {item.isCurrent ? 'Present' : (item.endDate && new Date(item.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }))}
                              </Badge>
                            )}
                            {item.location && (
                              <Badge variant="outline">
                                <MapPin className="h-3 w-3 mr-1" />
                                {item.location}
                              </Badge>
                            )}
                            {item.industry && (
                              <Badge variant="outline">{getIndustryLabel(item.industry)}</Badge>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-sm text-muted-foreground mt-2">{item.description}</p>
                          )}
                          {item.skills && item.skills.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {item.skills.map((skill, i) => (
                                <Badge key={i} variant="outline" className="text-xs">{skill}</Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEditWorks(item)} data-testid={`button-edit-works-${item.id}`}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteWorksMutation.mutate(item.id)} data-testid={`button-delete-works-${item.id}`}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No work experience added yet</h3>
                <p className="text-muted-foreground mb-4">Add your professional experience to showcase your career</p>
                <Button onClick={() => { setWorksDialogOpen(true); setEditingWorks(null); worksForm.reset(); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Experience
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Works Dialog */}
          <Dialog open={worksDialogOpen} onOpenChange={setWorksDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingWorks ? 'Edit Experience' : 'Add Experience'}</DialogTitle>
              </DialogHeader>
              <Form {...worksForm}>
                <form onSubmit={worksForm.handleSubmit(onWorksSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={worksForm.control}
                      name="company"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Google" {...field} data-testid="input-works-company" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={worksForm.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Role *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Software Engineer" {...field} data-testid="input-works-role" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={worksForm.control}
                      name="employmentType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Employment Type</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-works-employment-type">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {(employmentTypesData?.items || employmentTypes).map((item) => (
                                <SelectItem key={item.code} value={item.code}>{item.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={worksForm.control}
                      name="industry"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Industry</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-works-industry">
                                <SelectValue placeholder="Select industry" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {(industriesData?.items || [
                                { code: 'technology', label: 'Technology' },
                                { code: 'finance', label: 'Finance' },
                                { code: 'healthcare', label: 'Healthcare' },
                                { code: 'education', label: 'Education' },
                                { code: 'retail', label: 'Retail' },
                                { code: 'manufacturing', label: 'Manufacturing' },
                                { code: 'other', label: 'Other' },
                              ]).map((item) => (
                                <SelectItem key={item.code} value={item.code}>{item.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={worksForm.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} data-testid="input-works-start-date" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={worksForm.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Date</FormLabel>
                          <FormControl>
                            <Input type="date" disabled={worksForm.watch('isCurrent')} {...field} value={field.value || ''} data-testid="input-works-end-date" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={worksForm.control}
                      name="isCurrent"
                      render={({ field }) => (
                        <FormItem className="flex items-end gap-2 pb-2">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} data-testid="checkbox-works-current" />
                          </FormControl>
                          <FormLabel className="!mt-0">Current position</FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={worksForm.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="City, State or Remote" {...field} data-testid="input-works-location" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={worksForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Describe your responsibilities and achievements..." {...field} data-testid="input-works-description" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setWorksDialogOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={createWorksMutation.isPending || updateWorksMutation.isPending} data-testid="button-save-works">
                      {(createWorksMutation.isPending || updateWorksMutation.isPending) ? 'Saving...' : 'Save'}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* ========================================
            SOCIALS TAB
        ======================================== */}
        <TabsContent value="socials" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Social Profiles</h2>
              <p className="text-muted-foreground">Connect your social media accounts</p>
            </div>
            <Button onClick={() => { setSocialsDialogOpen(true); setEditingSocials(null); socialsForm.reset(); }} data-testid="button-add-socials">
              <Plus className="h-4 w-4 mr-2" />
              Add Social
            </Button>
          </div>

          {socialsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : socialsData?.items && socialsData.items.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {socialsData.items.map((item) => {
                const platform = getSocialPlatform(item.platform);
                return (
                  <Card key={item.id} data-testid={`card-socials-${item.id}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-xl">
                            {platform.icon}
                          </div>
                          <div>
                            <CardTitle className="text-base">{platform.label}</CardTitle>
                            {item.username && (
                              <CardDescription>@{item.username}</CardDescription>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" asChild>
                            <a href={item.profileUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleEditSocials(item)} data-testid={`button-edit-socials-${item.id}`}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => deleteSocialsMutation.mutate(item.id)} data-testid={`button-delete-socials-${item.id}`}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-2">
                        {item.isPublic ? (
                          <Badge variant="outline" className="text-green-600">
                            <Globe className="h-3 w-3 mr-1" />
                            Public
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-gray-500">
                            <Lock className="h-3 w-3 mr-1" />
                            Private
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Share2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No social profiles added yet</h3>
                <p className="text-muted-foreground mb-4">Connect your social media accounts to build your network</p>
                <Button onClick={() => { setSocialsDialogOpen(true); setEditingSocials(null); socialsForm.reset(); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Social Profile
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Socials Dialog */}
          <Dialog open={socialsDialogOpen} onOpenChange={setSocialsDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingSocials ? 'Edit Social Profile' : 'Add Social Profile'}</DialogTitle>
              </DialogHeader>
              <Form {...socialsForm}>
                <form onSubmit={socialsForm.handleSubmit(onSocialsSubmit)} className="space-y-4">
                  <FormField
                    control={socialsForm.control}
                    name="platform"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Platform *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={!!editingSocials}>
                          <FormControl>
                            <SelectTrigger data-testid="select-socials-platform">
                              <SelectValue placeholder="Select platform" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {(socialPlatformsData?.items || socialPlatforms).map((item: any) => (
                              <SelectItem key={item.code} value={item.code}>
                                <span className="flex items-center gap-2">
                                  <span>{item.icon || '🔗'}</span>
                                  <span>{item.label}</span>
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={socialsForm.control}
                    name="profileUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Profile URL *</FormLabel>
                        <FormControl>
                          <Input placeholder="https://..." {...field} data-testid="input-socials-url" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={socialsForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="@username" {...field} data-testid="input-socials-username" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={socialsForm.control}
                    name="isPublic"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} data-testid="checkbox-socials-public" />
                        </FormControl>
                        <FormLabel className="!mt-0">Visible to others</FormLabel>
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setSocialsDialogOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={createSocialsMutation.isPending || updateSocialsMutation.isPending} data-testid="button-save-socials">
                      {(createSocialsMutation.isPending || updateSocialsMutation.isPending) ? 'Saving...' : 'Save'}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* ========================================
            INTERESTS TAB
        ======================================== */}
        <TabsContent value="interests" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Interests & Hobbies</h2>
              <p className="text-muted-foreground">Share what you're passionate about</p>
            </div>
            <Button onClick={() => { setInterestsDialogOpen(true); setEditingInterests(null); interestsForm.reset(); }} data-testid="button-add-interests">
              <Plus className="h-4 w-4 mr-2" />
              Add Interest
            </Button>
          </div>

          {interestsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : interestsData?.items && interestsData.items.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {interestsData.items.map((item) => {
                const category = getInterestCategory(item.category);
                return (
                  <Card key={item.id} data-testid={`card-interests-${item.id}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xl">{category.icon}</span>
                            <CardTitle className="text-base">{item.interest}</CardTitle>
                          </div>
                          <CardDescription>{category.label}</CardDescription>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {item.level && (
                              <Badge variant="secondary">{item.level}</Badge>
                            )}
                            {item.yearsOfExperience !== undefined && item.yearsOfExperience > 0 && (
                              <Badge variant="outline">{item.yearsOfExperience} years</Badge>
                            )}
                            {item.isPublic ? (
                              <Badge variant="outline" className="text-green-600">
                                <Globe className="h-3 w-3 mr-1" />
                                Public
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-gray-500">
                                <Lock className="h-3 w-3 mr-1" />
                                Private
                              </Badge>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-sm text-muted-foreground mt-2">{item.description}</p>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleEditInterests(item)} data-testid={`button-edit-interests-${item.id}`}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => deleteInterestsMutation.mutate(item.id)} data-testid={`button-delete-interests-${item.id}`}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No interests added yet</h3>
                <p className="text-muted-foreground mb-4">Share your hobbies and passions with the community</p>
                <Button onClick={() => { setInterestsDialogOpen(true); setEditingInterests(null); interestsForm.reset(); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Interest
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Interests Dialog */}
          <Dialog open={interestsDialogOpen} onOpenChange={setInterestsDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingInterests ? 'Edit Interest' : 'Add Interest'}</DialogTitle>
              </DialogHeader>
              <Form {...interestsForm}>
                <form onSubmit={interestsForm.handleSubmit(onInterestsSubmit)} className="space-y-4">
                  <FormField
                    control={interestsForm.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-interests-category">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {(interestCategoriesData?.items || interestCategories).map((item: any) => (
                              <SelectItem key={item.code} value={item.code}>
                                <span className="flex items-center gap-2">
                                  <span>{item.icon || '✨'}</span>
                                  <span>{item.label}</span>
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={interestsForm.control}
                    name="interest"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Interest *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Playing Tennis, Rock Climbing" {...field} data-testid="input-interests-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={interestsForm.control}
                      name="level"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Skill Level</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-interests-level">
                                <SelectValue placeholder="Select level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {skillLevels.map((item) => (
                                <SelectItem key={item.code} value={item.code}>{item.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={interestsForm.control}
                      name="yearsOfExperience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Years of Experience</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0" {...field} data-testid="input-interests-years" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={interestsForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Tell us more about this interest..." {...field} data-testid="input-interests-description" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={interestsForm.control}
                    name="isPublic"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} data-testid="checkbox-interests-public" />
                        </FormControl>
                        <FormLabel className="!mt-0">Visible to others</FormLabel>
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setInterestsDialogOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={createInterestsMutation.isPending || updateInterestsMutation.isPending} data-testid="button-save-interests">
                      {(createInterestsMutation.isPending || updateInterestsMutation.isPending) ? 'Saving...' : 'Save'}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
}
