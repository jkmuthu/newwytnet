import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { CheckCircle2, Circle, Sparkles } from "lucide-react";

// Validation: Date of birth must be at least 18 years ago
const isAtLeast18 = (dateString: string) => {
  if (!dateString) return true; // Optional field
  const dob = new Date(dateString);
  const today = new Date();
  const age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    return age - 1 >= 18;
  }
  return age >= 18;
};

const basicInfoSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  gender: z.string().optional(),
  dateOfBirth: z.string().optional().refine(
    (val) => !val || isAtLeast18(val),
    "You must be at least 18 years old"
  ),
});

const myNeedsSchema = z.object({
  needs: z.string().min(10, "Please describe your needs (minimum 10 characters)"),
});

const myOffersSchema = z.object({
  offers: z.string().min(10, "Please describe what you offer (minimum 10 characters)"),
});

const socialSchema = z.object({
  linkedin: z.string().optional(),
  twitter: z.string().optional(),
  instagram: z.string().optional(),
});

type BasicInfoForm = z.infer<typeof basicInfoSchema>;
type MyNeedsForm = z.infer<typeof myNeedsSchema>;
type MyOffersForm = z.infer<typeof myOffersSchema>;
type SocialForm = z.infer<typeof socialSchema>;

const STEPS = [
  { id: 1, name: "Basic Info", icon: Circle },
  { id: 2, name: "MyNeeds", icon: Circle },
  { id: 3, name: "MyOffers", icon: Circle },
  { id: 4, name: "Connect Socials", icon: Circle },
];

interface ProfileWizardProps {
  open: boolean;
  onClose: () => void;
}

export default function ProfileWizard({ open, onClose }: ProfileWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const { toast } = useToast();

  const { data: user } = useQuery({
    queryKey: ["/api/auth/user"],
  });

  // Forms for each step
  const basicInfoForm = useForm<BasicInfoForm>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      name: "",
      email: "",
      gender: "",
      dateOfBirth: "",
    },
  });

  const myNeedsForm = useForm<MyNeedsForm>({
    resolver: zodResolver(myNeedsSchema),
    defaultValues: {
      needs: "",
    },
  });

  const myOffersForm = useForm<MyOffersForm>({
    resolver: zodResolver(myOffersSchema),
    defaultValues: {
      offers: "",
    },
  });

  const socialForm = useForm<SocialForm>({
    resolver: zodResolver(socialSchema),
    defaultValues: {
      linkedin: "",
      twitter: "",
      instagram: "",
    },
  });

  // Update form values when user data loads
  useEffect(() => {
    if (user && open) {
      basicInfoForm.reset({
        name: (user as any)?.name || "",
        email: (user as any)?.email || "",
        gender: (user as any)?.gender || "",
        dateOfBirth: (user as any)?.dateOfBirth || "",
      });
    }
  }, [user, open]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/profile/basic-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
  });

  const createNeedMutation = useMutation({
    mutationFn: async (data: { needs: string }) => {
      const response = await fetch("/api/needs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "My Initial Needs",
          description: data.needs,
          category: "general",
        }),
      });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
  });

  const createOfferMutation = useMutation({
    mutationFn: async (data: { offers: string }) => {
      const response = await fetch("/api/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "My Initial Offers",
          description: data.offers,
          category: "general",
        }),
      });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
  });

  const completeWizardMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/profile/complete-wizard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Profile Complete! 🎉",
        description: `You've earned ${data.pointsEarned || 10} WytPoints for completing your profile!`,
      });
      onClose();
    },
  });

  const handleBasicInfoSubmit = async (data: BasicInfoForm) => {
    await updateProfileMutation.mutateAsync(data);
    setCurrentStep(2);
  };

  const handleMyNeedsSubmit = async (data: MyNeedsForm) => {
    await createNeedMutation.mutateAsync(data);
    setCurrentStep(3);
  };

  const handleMyOffersSubmit = async (data: MyOffersForm) => {
    await createOfferMutation.mutateAsync(data);
    setCurrentStep(4);
  };

  const handleSocialSubmit = async (data: SocialForm) => {
    await completeWizardMutation.mutateAsync({
      socialLinks: data,
    });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Form {...basicInfoForm}>
            <form
              onSubmit={basicInfoForm.handleSubmit(handleBasicInfoSubmit)}
              className="space-y-4"
              data-testid="form-basic-info"
            >
              <FormField
                control={basicInfoForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Your full name" data-testid="input-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={basicInfoForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="your@email.com"
                        data-testid="input-email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={basicInfoForm.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger data-testid="select-gender">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                        <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={basicInfoForm.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" data-testid="input-dob" max={new Date().toISOString().split('T')[0]} />
                    </FormControl>
                    <FormDescription className="text-xs text-muted-foreground">
                      You must be at least 18 years old
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  data-testid="button-next-step1"
                >
                  {updateProfileMutation.isPending ? "Saving..." : "Next"}
                </Button>
              </div>
            </form>
          </Form>
        );

      case 2:
        return (
          <Form {...myNeedsForm}>
            <form
              onSubmit={myNeedsForm.handleSubmit(handleMyNeedsSubmit)}
              className="space-y-4"
              data-testid="form-my-needs"
            >
              <FormField
                control={myNeedsForm.control}
                name="needs"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What do you need help with? *</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Describe what you're looking for, challenges you're facing, or help you need..."
                        rows={5}
                        data-testid="textarea-needs"
                      />
                    </FormControl>
                    <FormDescription>
                      Share your needs to connect with others who can help. You'll earn points for
                      posting! (Please describe your needs - minimum 10 characters)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                  data-testid="button-back-step2"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={createNeedMutation.isPending}
                  data-testid="button-next-step2"
                >
                  {createNeedMutation.isPending ? "Saving..." : "Next"}
                </Button>
              </div>
            </form>
          </Form>
        );

      case 3:
        return (
          <Form {...myOffersForm}>
            <form
              onSubmit={myOffersForm.handleSubmit(handleMyOffersSubmit)}
              className="space-y-4"
              data-testid="form-my-offers"
            >
              <FormField
                control={myOffersForm.control}
                name="offers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What can you offer to others? *</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Describe your skills, services, products, or expertise you can share..."
                        rows={5}
                        data-testid="textarea-offers"
                      />
                    </FormControl>
                    <FormDescription>
                      Share what you can offer to help others in the community. (Please describe your offers - minimum 10 characters)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(2)}
                  data-testid="button-back-step3"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={createOfferMutation.isPending}
                  data-testid="button-next-step3"
                >
                  {createOfferMutation.isPending ? "Saving..." : "Next"}
                </Button>
              </div>
            </form>
          </Form>
        );

      case 4:
        return (
          <Form {...socialForm}>
            <form
              onSubmit={socialForm.handleSubmit(handleSocialSubmit)}
              className="space-y-4"
              data-testid="form-social"
            >
              <FormField
                control={socialForm.control}
                name="linkedin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LinkedIn URL</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="https://linkedin.com/in/yourprofile"
                        data-testid="input-linkedin"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={socialForm.control}
                name="twitter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Twitter/X URL</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="https://twitter.com/yourhandle"
                        data-testid="input-twitter"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={socialForm.control}
                name="instagram"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instagram URL</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="https://instagram.com/yourhandle"
                        data-testid="input-instagram"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormDescription>
                Connect your social profiles to build trust and expand your network.
              </FormDescription>
              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(3)}
                  data-testid="button-back-step4"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={completeWizardMutation.isPending}
                  data-testid="button-complete-wizard"
                >
                  {completeWizardMutation.isPending ? "Completing..." : "Complete Profile"}
                </Button>
              </div>
            </form>
          </Form>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="h-6 w-6 text-primary" />
            Complete Your Profile
          </DialogTitle>
          <DialogDescription>
            Complete your profile to unlock the full WytNet experience and earn WytPoints!
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="py-6">
          <div className="flex items-center justify-between relative">
            {/* Progress bar */}
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
              />
            </div>

            {/* Step indicators */}
            {STEPS.map((step) => (
              <div key={step.id} className="flex flex-col items-center relative z-10">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                    currentStep >= step.id
                      ? "bg-primary border-primary text-primary-foreground"
                      : "bg-background border-muted"
                  }`}
                  data-testid={`step-indicator-${step.id}`}
                >
                  {currentStep > step.id ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-medium">{step.id}</span>
                  )}
                </div>
                <span
                  className={`text-xs mt-2 ${
                    currentStep >= step.id ? "text-foreground font-medium" : "text-muted-foreground"
                  }`}
                >
                  {step.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="py-4">{renderStepContent()}</div>
      </DialogContent>
    </Dialog>
  );
}
