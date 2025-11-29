import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, User, Building2 } from "lucide-react";

// Category options based on post type
const NEED_CATEGORIES = [
  { value: "need_job", label: "Need a Job" },
  { value: "house_for_rent", label: "House for Rent" },
  { value: "require_service", label: "Require a Service" },
  { value: "product_for_use", label: "Product for my Use" },
  { value: "bulk_supply", label: "Product for Bulk Supply" },
  { value: "other", label: "Other" },
];

const OFFER_CATEGORIES = [
  { value: "selling_bike", label: "Selling my Bike" },
  { value: "selling_car", label: "Selling my Car" },
  { value: "selling_property", label: "Selling my Property" },
  { value: "renting_house", label: "Renting my House" },
  { value: "providing_service", label: "Providing Service" },
  { value: "other", label: "Other" },
];

const VALIDITY_OPTIONS = [
  { value: 7, label: "7 Days" },
  { value: 15, label: "15 Days" },
  { value: 60, label: "60 Days" },
  { value: 90, label: "90 Days" },
];

const formSchema = z.object({
  postFor: z.enum(["personal", "organization"], {
    required_error: "Please select who this post is for",
  }),
  organizationId: z.string().optional(),
  postType: z.enum(["need", "offer"], {
    required_error: "Post type is required",
    invalid_type_error: "Invalid post type selected"
  }),
  category: z.string()
    .min(1, "Please select a category")
    .refine((val) => val !== "", {
      message: "Category selection is mandatory"
    }),
  description: z.string()
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description cannot exceed 500 characters")
    .refine((val) => val.trim().length >= 10, {
      message: "Description must contain at least 10 non-whitespace characters"
    })
    .refine((val) => !/[<>]/.test(val), {
      message: "Description cannot contain HTML tags"
    })
    .refine((val) => {
      // Check for spam patterns
      const spamPatterns = /\b(buy now|click here|limited time|act now)\b/gi;
      return !spamPatterns.test(val);
    }, {
      message: "Description contains spam-like content"
    }),
  validityDays: z.number({
    required_error: "Please select validity period",
  }).min(7).max(90),
  location: z.string().optional(),
  budget: z.number()
    .positive("Budget must be positive")
    .max(10000000, "Budget exceeds maximum allowed value")
    .optional()
    .nullable(),
}).refine((data) => {
  // If organization is selected, organizationId is required
  if (data.postFor === "organization" && !data.organizationId) {
    return false;
  }
  return true;
}, {
  message: "Please select an organization",
  path: ["organizationId"],
});

type FormValues = z.infer<typeof formSchema>;

interface WytWallPostFormProps {
  defaultPostType?: "need" | "offer";
  onSuccess?: () => void;
}

export default function WytWallPostForm({ defaultPostType = "need", onSuccess }: WytWallPostFormProps) {
  const { toast } = useToast();
  const [selectedPostType, setSelectedPostType] = useState<"need" | "offer">(defaultPostType);
  const [postFor, setPostFor] = useState<"personal" | "organization">("personal");

  // Fetch user's organizations
  const { data: orgsData } = useQuery({
    queryKey: ['/api/organizations/my-orgs'],
    refetchOnWindowFocus: false,
  });

  const userOrgs = (orgsData as any)?.organizations || [];

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      postFor: "personal",
      organizationId: "",
      postType: defaultPostType,
      category: "",
      description: "",
      validityDays: 7,
    },
  });

  const createPostMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      return await apiRequest("/api/wytwall/posts", "POST", data);
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: `Your ${selectedPostType} has been posted successfully!`,
      });
      form.reset({
        postFor: "personal",
        organizationId: "",
        postType: defaultPostType,
        category: "",
        description: "",
        validityDays: 7,
      });
      setPostFor("personal");
      queryClient.invalidateQueries({ queryKey: ["/api/wytwall/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/wytwall/my-posts"] });
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create post",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormValues) => {
    createPostMutation.mutate(data);
  };

  const categories = selectedPostType === "need" ? NEED_CATEGORIES : OFFER_CATEGORIES;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Post For Selection - Personal or Organization */}
        <FormField
          control={form.control}
          name="postFor"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">Post For</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={(value) => {
                    field.onChange(value);
                    setPostFor(value as "personal" | "organization");
                    if (value === "personal") {
                      form.setValue("organizationId", "");
                    }
                  }}
                  value={field.value}
                  className="flex gap-4"
                  data-testid="radio-post-for"
                >
                  <div className={`flex items-center space-x-2 border rounded-lg px-4 py-3 hover:bg-accent/50 transition-colors cursor-pointer flex-1 ${field.value === "personal" ? "border-primary bg-primary/5" : ""}`}>
                    <RadioGroupItem value="personal" id="personal" data-testid="radio-personal" />
                    <User className="h-4 w-4 text-muted-foreground" />
                    <label htmlFor="personal" className="text-sm font-medium cursor-pointer flex-1">
                      Personal
                    </label>
                  </div>
                  <div className={`flex items-center space-x-2 border rounded-lg px-4 py-3 hover:bg-accent/50 transition-colors cursor-pointer flex-1 ${field.value === "organization" ? "border-primary bg-primary/5" : ""}`}>
                    <RadioGroupItem value="organization" id="organization" data-testid="radio-organization" />
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <label htmlFor="organization" className="text-sm font-medium cursor-pointer flex-1">
                      Organization
                    </label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Organization Selection - Only show when "Organization" is selected */}
        {postFor === "organization" && (
          <FormField
            control={form.control}
            name="organizationId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select Organization</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-organization">
                      <SelectValue placeholder="Choose an organization" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {userOrgs.length === 0 ? (
                      <SelectItem value="no-orgs" disabled>
                        No organizations found
                      </SelectItem>
                    ) : (
                      userOrgs.map((org: any) => (
                        <SelectItem key={org.id} value={org.id} data-testid={`option-org-${org.id}`}>
                          {org.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  All org members with permissions will receive notifications
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Post Type Selection */}
        <FormField
          control={form.control}
          name="postType"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">What would you like to post?</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={(value) => {
                    field.onChange(value);
                    setSelectedPostType(value as "need" | "offer");
                    form.setValue("category", ""); // Reset category when post type changes
                  }}
                  value={field.value}
                  className="flex gap-4"
                  data-testid="radio-post-type"
                >
                  <div className={`flex items-center space-x-2 border rounded-lg px-4 py-3 hover:bg-accent/50 transition-colors cursor-pointer flex-1 ${field.value === "need" ? "border-primary bg-primary/5" : ""}`}>
                    <RadioGroupItem value="need" id="need" data-testid="radio-need" />
                    <label htmlFor="need" className="text-sm font-medium cursor-pointer flex-1">
                      I Need
                    </label>
                  </div>
                  <div className={`flex items-center space-x-2 border rounded-lg px-4 py-3 hover:bg-accent/50 transition-colors cursor-pointer flex-1 ${field.value === "offer" ? "border-primary bg-primary/5" : ""}`}>
                    <RadioGroupItem value="offer" id="offer" data-testid="radio-offer" />
                    <label htmlFor="offer" className="text-sm font-medium cursor-pointer flex-1">
                      I Offer
                    </label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Category Selection */}
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger data-testid="select-category">
                    <SelectValue placeholder="Choose from the list" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value} data-testid={`option-${category.value}`}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={`Describe what you ${selectedPostType === "need" ? "need" : "offer"}...`}
                  className="resize-none"
                  rows={4}
                  maxLength={200}
                  data-testid="textarea-description"
                  {...field}
                />
              </FormControl>
              <div className="flex justify-between items-center">
                <FormMessage />
                <span className="text-xs text-muted-foreground">
                  {field.value?.length || 0}/200
                </span>
              </div>
            </FormItem>
          )}
        />

        {/* Validity Days Selection */}
        <FormField
          control={form.control}
          name="validityDays"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Validity Period</FormLabel>
              <Select 
                onValueChange={(value) => field.onChange(parseInt(value))} 
                value={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger data-testid="select-validity">
                    <SelectValue placeholder="Select validity period" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {VALIDITY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value.toString()} data-testid={`option-validity-${option.value}`}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Post will automatically expire after this period
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full"
          disabled={createPostMutation.isPending}
          data-testid="button-submit-post"
        >
          {createPostMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Posting...
            </>
          ) : (
            "Submit the Post"
          )}
        </Button>
      </form>
    </Form>
  );
}
