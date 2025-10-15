import { db } from "../db";
import { users } from "../../shared/schema";
import { eq } from "drizzle-orm";

interface EmailSendResponse {
  type?: string;
  message?: string;
  data?: any;
  request_id?: string;
  status?: string;
  hasError?: boolean;
  errors?: string;
  code?: string;
  apiError?: string;
}

interface OTPData {
  email: string;
  otp: string;
  expiresAt: Date;
  requestId?: string;
}

// In-memory OTP storage (for development - use Redis/database in production)
const otpStorage = new Map<string, OTPData>();

class MSG91Service {
  private authKey: string;
  private templateId: string;
  private domain: string;
  private fromEmail: string;
  private baseUrl = "https://control.msg91.com/api/v5";

  constructor() {
    this.authKey = process.env.MSG91_AUTH_KEY || "464667ALFYbnq3689f001dP1";
    this.templateId = process.env.MSG91_EMAIL_TEMPLATE_ID || "global_otp";
    this.domain = "wytnet.com";
    this.fromEmail = "no-reply@wytnet.com";
  }

  /**
   * Check if MSG91 is configured
   */
  isConfigured(): boolean {
    return !!(this.authKey && this.templateId);
  }

  /**
   * Send OTP via Email using MSG91 Email Template API
   */
  async sendEmailOTP(email: string, userName?: string): Promise<{ success: boolean; message: string; requestId?: string }> {
    if (!this.isConfigured()) {
      return { success: false, message: "MSG91 not configured. Please set MSG91_AUTH_KEY and MSG91_EMAIL_TEMPLATE_ID." };
    }

    try {
      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Try Email Template API first
      const templateResult = await this.sendViaTemplateAPI(email, userName, otp);
      if (templateResult.success) {
        // Store OTP for verification
        otpStorage.set(email, {
          email,
          otp,
          expiresAt,
          requestId: templateResult.requestId || `email_${Date.now()}`
        });
        return templateResult;
      }

      // Fallback to simple OTP API if template fails
      console.log(`🔧 MSG91: Template API failed, trying simple OTP API...`);
      const otpResult = await this.sendViaOTPAPI(email, userName, otp);
      if (otpResult.success) {
        // Store OTP for verification
        otpStorage.set(email, {
          email,
          otp,
          expiresAt,
          requestId: otpResult.requestId || `email_${Date.now()}`
        });
      }
      return otpResult;
    } catch (error) {
      console.error("❌ MSG91: Error sending email OTP:", error);
      return { success: false, message: "Failed to send OTP. Please try again." };
    }
  }

  /**
   * Send OTP via MSG91 Email Template API
   */
  private async sendViaTemplateAPI(email: string, userName?: string, otp?: string): Promise<{ success: boolean; message: string; requestId?: string }> {
    const url = `https://control.msg91.com/api/v5/email/send`;
    
    const body = {
      recipients: [
        {
          to: [
            {
              email: email,
              name: userName || email.split("@")[0]
            }
          ],
          variables: {
            "OTP": otp,
            "NAME": userName || email.split("@")[0],
            "EMAIL": email,
            "COMPANY": "WytNet"
          }
        }
      ],
      from: {
        email: this.fromEmail
      },
      template_id: this.templateId
    };

    console.log(`🔧 MSG91: Sending email OTP to ${email} using template ${this.templateId}`);
    console.log(`🔧 MSG91: Request body:`, JSON.stringify(body, null, 2));

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "authkey": this.authKey,
        "Accept": "application/json"
      },
      body: JSON.stringify(body)
    });

    const result: EmailSendResponse = await response.json();
    console.log(`🔧 MSG91: Template API Response status: ${response.status}`);
    console.log(`🔧 MSG91: Template API Response body:`, JSON.stringify(result, null, 2));

    if (response.ok && result.status !== "fail") {
      console.log(`✅ MSG91: Email OTP sent successfully via template API to ${email}`);
      return { 
        success: true, 
        message: "OTP sent successfully to your email address", 
        requestId: result.request_id 
      };
    } else {
      console.error("❌ MSG91: Template API failed:", result);
      return { success: false, message: result.message || "Template API failed" };
    }
  }

  /**
   * Fallback: Send simple email without template
   */
  private async sendViaOTPAPI(email: string, userName?: string, otp?: string): Promise<{ success: boolean; message: string; requestId?: string }> {
    const url = `https://control.msg91.com/api/v5/email/send`;
    
    // Fallback: Send a simple email without template
    const body = {
      recipients: [
        {
          to: [
            {
              email: email,
              name: userName || email.split("@")[0]
            }
          ]
        }
      ],
      from: {
        email: this.fromEmail
      },
      subject: "Your WytNet Login Code",
      body: `
        <h2>Your WytNet Login Code</h2>
        <p>Hi ${userName || email.split("@")[0]},</p>
        <p>Your verification code is: <strong style="font-size: 24px; color: #4F46E5;">${otp}</strong></p>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this code, please ignore this email.</p>
        <br>
        <p>Best regards,<br>WytNet Team</p>
      `
    };

    console.log(`🔧 MSG91: Sending simple email OTP to ${email} (no template)`);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "authkey": this.authKey,
        "Accept": "application/json"
      },
      body: JSON.stringify(body)
    });

    const result: any = await response.json();
    console.log(`🔧 MSG91: Simple Email API Response status: ${response.status}`);
    console.log(`🔧 MSG91: Simple Email API Response body:`, JSON.stringify(result, null, 2));

    if (response.ok && result.status !== "fail") {
      console.log(`✅ MSG91: Email OTP sent successfully via simple email to ${email}`);
      return { 
        success: true, 
        message: "OTP sent successfully to your email address", 
        requestId: result.request_id || `simple_${Date.now()}`
      };
    } else {
      console.error("❌ MSG91: Simple email API also failed:", result);
      return { success: false, message: result.message || "Email sending failed. Please check your MSG91 configuration." };
    }
  }

  /**
   * Verify OTP (Local verification since we're using email templates)
   */
  async verifyEmailOTP(email: string, userOTP: string): Promise<{ success: boolean; message: string }> {
    try {
      // Check our local storage for OTP validation
      const storedOTP = otpStorage.get(email);
      
      if (!storedOTP) {
        return { success: false, message: "No OTP found for this email. Please request a new OTP." };
      }

      if (storedOTP.expiresAt < new Date()) {
        otpStorage.delete(email);
        return { success: false, message: "OTP has expired. Please request a new OTP." };
      }

      if (storedOTP.otp !== userOTP) {
        return { success: false, message: "Invalid OTP. Please check and try again." };
      }

      // Clean up stored OTP after successful verification
      otpStorage.delete(email);
      console.log(`✅ MSG91: Email OTP verified successfully for ${email}`);
      return { success: true, message: "OTP verified successfully" };
    } catch (error) {
      console.error("❌ MSG91: Error verifying email OTP:", error);
      return { success: false, message: "Failed to verify OTP. Please try again." };
    }
  }

  /**
   * Resend OTP to email
   */
  async resendEmailOTP(email: string, userName?: string): Promise<{ success: boolean; message: string }> {
    // Clean up any existing OTP
    otpStorage.delete(email);
    
    // Send new OTP
    const result = await this.sendEmailOTP(email, userName);
    return result;
  }

  /**
   * Check if user exists by email and create/update for OTP auth
   */
  async findOrCreateUserForOTP(email: string, name?: string): Promise<any> {
    try {
      // Check if user exists
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, email));

      if (existingUser) {
        // Update last login
        const [updatedUser] = await db
          .update(users)
          .set({
            lastLoginAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(users.id, existingUser.id))
          .returning();

        const authMethods = Array.isArray(updatedUser.authMethods) ? updatedUser.authMethods as string[] : [];
        const socialProviders = Array.isArray(updatedUser.socialProviders) ? updatedUser.socialProviders as string[] : [];
        return {
          id: updatedUser.id,
          name: updatedUser.name || `${updatedUser.firstName || ''} ${updatedUser.lastName || ''}`.trim(),
          email: updatedUser.email,
          profileImageUrl: updatedUser.profileImageUrl,
          role: updatedUser.role,
          authMethods,
          socialProviders,
        };
      } else {
        // Create new user for OTP authentication
        const [newUser] = await db
          .insert(users)
          .values({
            id: `usr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            email: email,
            firstName: name?.split(' ')[0] || email.split("@")[0],
            lastName: name?.split(' ').slice(1).join(' ') || undefined,
            role: "user",
            authMethods: ["email_otp"],
            socialProviders: [],
            socialIds: {},
            isVerified: true, // Email is verified through OTP
            whatsappNumber: "", // Required field, empty for OTP auth
            lastLoginAt: new Date(),
          })
          .returning();

        const authMethods = Array.isArray(newUser.authMethods) ? newUser.authMethods as string[] : [];
        const socialProviders = Array.isArray(newUser.socialProviders) ? newUser.socialProviders as string[] : [];
        return {
          id: newUser.id,
          name: newUser.name || `${newUser.firstName || ''} ${newUser.lastName || ''}`.trim(),
          email: newUser.email,
          profileImageUrl: newUser.profileImageUrl,
          role: newUser.role,
          authMethods,
          socialProviders,
        };
      }
    } catch (error) {
      console.error("Error in findOrCreateUserForOTP:", error);
      throw error;
    }
  }

  /**
   * Clean up expired OTPs (should be called periodically)
   */
  cleanupExpiredOTPs(): void {
    const now = new Date();
    const entries = Array.from(otpStorage.entries());
    for (const [email, data] of entries) {
      if (data.expiresAt < now) {
        otpStorage.delete(email);
      }
    }
  }
}

export default new MSG91Service();