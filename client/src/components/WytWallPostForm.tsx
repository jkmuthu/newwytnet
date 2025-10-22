import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

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

const formSchema = z.object({
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
  location: z.string().optional(),
  budget: z.number()
    .positive("Budget must be positive")
    .max(10000000, "Budget exceeds maximum allowed value")
    .optional()
    .nullable(),
});

type FormValues = z.infer<typeof formSchema>;

interface WytWallPostFormProps {
  defaultPostType?: "need" | "offer";
  onSuccess?: () => void;
}

export default function WytWallPostForm({ defaultPostType = "need", onSuccess }: WytWallPostFormProps) {
  const { toast } = useToast();
  const [selectedPostType, setSelectedPostType] = useState<"need" | "offer">(defaultPostType);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      postType: defaultPostType,
      category: "",
      description: "",
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
        postType: defaultPostType,
        category: "",
        description: "",
      });
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
                  <div className="flex items-center space-x-2 border rounded-lg px-4 py-3 hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                    <RadioGroupItem value="need" id="need" data-testid="radio-need" />
                    <label htmlFor="need" className="text-sm font-medium cursor-pointer flex-1">
                      I Need
                    </label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg px-4 py-3 hover:bg-accent/50 transition-colors cursor-pointer flex-1">
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
            `Post ${selectedPostType === "need" ? "Need" : "Offer"}`
          )}
        </Button>
      </form>
    </Form>
  );
}
