import { db } from "../db";
import { whatsappUsers } from "../../shared/schema";
import { eq } from "drizzle-orm";

interface EmailSendResponse {
  type?: string;
  message?: string;
  data?: any;
  request_id?: string;
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
    this.templateId = process.env.MSG91_EMAIL_TEMPLATE_ID || "";
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

      // Use MSG91 Email Template API
      const url = `${this.baseUrl}/email/send`;
      
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
        domain: this.domain,
        template_id: this.templateId
      };

      console.log(`🔧 MSG91: Sending email OTP to ${email} using template ${this.templateId}`);

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

      if (response.ok) {
        // Store OTP for verification (in production, use database/Redis)
        otpStorage.set(email, {
          email,
          otp,
          expiresAt,
          requestId: result.request_id || `email_${Date.now()}`
        });

        console.log(`✅ MSG91: Email OTP sent successfully to ${email}`);
        return { 
          success: true, 
          message: "OTP sent successfully to your email address", 
          requestId: result.request_id 
        };
      } else {
        console.error("❌ MSG91: Failed to send email OTP:", result);
        return { success: false, message: result.message || "Failed to send OTP. Please check your email template configuration." };
      }
    } catch (error) {
      console.error("❌ MSG91: Error sending email OTP:", error);
      return { success: false, message: "Failed to send OTP. Please try again." };
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
        .from(whatsappUsers)
        .where(eq(whatsappUsers.email, email));

      if (existingUser) {
        // Update last login
        const [updatedUser] = await db
          .update(whatsappUsers)
          .set({
            lastLoginAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(whatsappUsers.id, existingUser.id))
          .returning();

        return {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          profileImageUrl: updatedUser.profileImageUrl,
          role: updatedUser.role,
          authMethods: updatedUser.authMethods as string[],
          socialProviders: updatedUser.socialProviders as string[],
        };
      } else {
        // Create new user for OTP authentication
        const [newUser] = await db
          .insert(whatsappUsers)
          .values({
            name: name || email.split("@")[0], // Use email prefix as name
            email: email,
            role: "user",
            authMethods: ["email_otp"],
            socialProviders: [],
            socialIds: {},
            isVerified: true, // Email is verified through OTP
            whatsappNumber: "", // Required field, empty for OTP auth
            lastLoginAt: new Date(),
          })
          .returning();

        return {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          profileImageUrl: newUser.profileImageUrl,
          role: newUser.role,
          authMethods: newUser.authMethods as string[],
          socialProviders: newUser.socialProviders as string[],
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