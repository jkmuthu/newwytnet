import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, ArrowLeft, RefreshCw } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

// Form schemas
const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  name: z.string().optional(),
});

const otpSchema = z.object({
  otp: z.string().min(6, "OTP must be 6 digits").max(6, "OTP must be 6 digits"),
});

type EmailFormData = z.infer<typeof emailSchema>;
type OTPFormData = z.infer<typeof otpSchema>;

interface EmailOTPFormProps {
  onBack?: () => void;
  onSuccess?: () => void;
}

export default function EmailOTPForm({ onBack, onSuccess }: EmailOTPFormProps) {
  const [step, setStep] = useState<"email" | "otp">("email");
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [canResend, setCanResend] = useState(true);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { toast } = useToast();

  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
      name: "",
    },
  });

  const otpForm = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const onSendOTP = async (data: EmailFormData) => {
    setIsLoading(true);
    try {
      await apiRequest("POST", "/api/auth/send-email-otp", {
        email: data.email,
        name: data.name || data.email.split("@")[0],
      });
      
      setEmail(data.email);
      setStep("otp");
      setCountdown(60); // 60 second countdown
      setCanResend(false);
      
      toast({
        title: "OTP Sent",
        description: `A 6-digit code has been sent to ${data.email}`,
      });
    } catch (error: any) {
      toast({
        title: "Failed to send OTP",
        description: error.message || "Please check your email address and try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onVerifyOTP = async (data: OTPFormData) => {
    setIsLoading(true);
    try {
      await apiRequest("POST", "/api/auth/verify-email-otp", {
        email,
        otp: data.otp,
      });
      
      toast({
        title: "Login Successful",
        description: `Welcome! You are now logged in.`,
      });
      
      // Redirect to dashboard
      if (onSuccess) {
        onSuccess();
      } else {
        window.location.href = "/";
      }
    } catch (error: any) {
      toast({
        title: "Invalid OTP",
        description: error.message || "Please check your code and try again",
        variant: "destructive",
      });
      // Reset OTP form
      otpForm.reset();
      if (otpInputRefs.current[0]) {
        otpInputRefs.current[0].focus();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onResendOTP = async () => {
    if (!canResend) return;
    
    setIsLoading(true);
    try {
      await apiRequest("POST", "/api/auth/resend-email-otp", {
        email,
      });
      
      setCountdown(60);
      setCanResend(false);
      
      toast({
        title: "OTP Resent",
        description: `A new code has been sent to ${email}`,
      });
    } catch (error: any) {
      toast({
        title: "Failed to resend OTP",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPChange = (value: string, index: number) => {
    if (value.length <= 1 && /^[0-9]*$/.test(value)) {
      const currentOTP = otpForm.getValues("otp").split("");
      currentOTP[index] = value;
      const newOTP = currentOTP.join("");
      otpForm.setValue("otp", newOTP);

      // Move to next input
      if (value && index < 5) {
        otpInputRefs.current[index + 1]?.focus();
      }

      // Auto-submit when all 6 digits are entered
      if (newOTP.length === 6) {
        otpForm.handleSubmit(onVerifyOTP)();
      }
    }
  };

  const handleOTPKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Backspace" && !otpForm.getValues("otp")[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleBackToEmail = () => {
    setStep("email");
    setEmail("");
    otpForm.reset();
  };

  return (
    <Card className="w-full max-w-md mx-auto" data-testid="email-otp-card">
      <CardHeader className="space-y-1 text-center">
        <div className="flex items-center justify-center mb-2">
          {step === "otp" && onBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToEmail}
              className="absolute left-4"
              data-testid="button-back-to-email"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <Mail className="h-8 w-8 text-blue-600" />
        </div>
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {step === "email" ? "Email OTP Login" : "Enter Verification Code"}
        </CardTitle>
        <CardDescription>
          {step === "email" 
            ? "We'll send a 6-digit code to your email address" 
            : `Enter the 6-digit code sent to ${email}`
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {step === "email" ? (
          <Form {...emailForm}>
            <form onSubmit={emailForm.handleSubmit(onSendOTP)} className="space-y-4">
              <FormField
                control={emailForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="Enter your email address"
                        data-testid="input-email"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={emailForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Your name"
                        data-testid="input-name"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
                data-testid="button-send-otp"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Mail className="h-4 w-4 mr-2" />
                )}
                {isLoading ? "Sending OTP..." : "Send OTP"}
              </Button>
            </form>
          </Form>
        ) : (
          <Form {...otpForm}>
            <form onSubmit={otpForm.handleSubmit(onVerifyOTP)} className="space-y-6">
              <div className="space-y-2">
                <FormLabel>Verification Code</FormLabel>
                <div className="flex justify-center space-x-2">
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <Input
                      key={index}
                      ref={(el) => (otpInputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      className="w-12 h-12 text-center text-lg font-semibold"
                      value={otpForm.getValues("otp")[index] || ""}
                      onChange={(e) => handleOTPChange(e.target.value, index)}
                      onKeyDown={(e) => handleOTPKeyDown(e, index)}
                      data-testid={`input-otp-${index}`}
                      autoFocus={index === 0}
                    />
                  ))}
                </div>
                {otpForm.formState.errors.otp && (
                  <p className="text-sm text-red-500 text-center">
                    {otpForm.formState.errors.otp.message}
                  </p>
                )}
              </div>

              <div className="text-center space-y-2">
                <Button
                  type="button"
                  variant="link"
                  onClick={onResendOTP}
                  disabled={!canResend || isLoading}
                  className="text-sm"
                  data-testid="button-resend-otp"
                >
                  {canResend ? (
                    <>
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Resend Code
                    </>
                  ) : (
                    `Resend in ${countdown}s`
                  )}
                </Button>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || otpForm.getValues("otp").length !== 6}
                data-testid="button-verify-otp"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {isLoading ? "Verifying..." : "Verify & Login"}
              </Button>
            </form>
          </Form>
        )}

        {onBack && (
          <div className="text-center pt-4">
            <Button
              variant="link"
              onClick={onBack}
              className="text-sm text-gray-500"
              data-testid="button-back"
            >
              Back to other login options
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}