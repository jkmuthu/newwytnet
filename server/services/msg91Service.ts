import { db } from "../db";
import { whatsappUsers } from "../../shared/schema";
import { eq } from "drizzle-orm";

interface SendOTPResponse {
  type: string;
  message: string;
  request_id?: string;
}

interface VerifyOTPResponse {
  type: string;
  message: string;
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
  private baseUrl = "https://control.msg91.com/api/v5";

  constructor() {
    this.authKey = process.env.MSG91_AUTH_KEY || "";
    this.templateId = process.env.MSG91_EMAIL_TEMPLATE_ID || "";
  }

  /**
   * Check if MSG91 is configured
   */
  isConfigured(): boolean {
    return !!(this.authKey && this.templateId);
  }

  /**
   * Send OTP via Email using MSG91 API
   */
  async sendEmailOTP(email: string, userName?: string): Promise<{ success: boolean; message: string; requestId?: string }> {
    if (!this.isConfigured()) {
      return { success: false, message: "MSG91 not configured. Please set MSG91_AUTH_KEY and MSG91_EMAIL_TEMPLATE_ID." };
    }

    try {
      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // For email OTP, we use email address instead of mobile
      const url = `${this.baseUrl}/otp`;
      const params = new URLSearchParams({
        template_id: this.templateId,
        mobile: email, // MSG91 uses 'mobile' parameter but it can be email for email OTP
        authkey: this.authKey,
        otp_expiry: "10", // 10 minutes
        realTimeResponse: "1"
      });

      const body = {
        OTP: otp,
        NAME: userName || "User",
        EMAIL: email
      };

      console.log(`🔧 MSG91: Sending email OTP to ${email}`);

      const response = await fetch(`${url}?${params}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(body)
      });

      const result: SendOTPResponse = await response.json();

      if (response.ok && result.type === "success") {
        // Store OTP for verification (in production, use database/Redis)
        otpStorage.set(email, {
          email,
          otp,
          expiresAt,
          requestId: result.request_id
        });

        console.log(`✅ MSG91: Email OTP sent successfully to ${email}`);
        return { 
          success: true, 
          message: "OTP sent successfully to your email address", 
          requestId: result.request_id 
        };
      } else {
        console.error("❌ MSG91: Failed to send email OTP:", result);
        return { success: false, message: result.message || "Failed to send OTP" };
      }
    } catch (error) {
      console.error("❌ MSG91: Error sending email OTP:", error);
      return { success: false, message: "Failed to send OTP. Please try again." };
    }
  }

  /**
   * Verify OTP using MSG91 API
   */
  async verifyEmailOTP(email: string, userOTP: string): Promise<{ success: boolean; message: string }> {
    if (!this.isConfigured()) {
      return { success: false, message: "MSG91 not configured" };
    }

    try {
      // First check our local storage for immediate validation
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

      // Verify with MSG91 API as well (optional double verification)
      const url = `${this.baseUrl}/otp/verify`;
      const params = new URLSearchParams({
        otp: userOTP,
        mobile: email // Using email instead of mobile for email OTP
      });

      const response = await fetch(`${url}?${params}`, {
        method: "GET",
        headers: {
          "authkey": this.authKey,
          "Accept": "application/json"
        }
      });

      const result: VerifyOTPResponse = await response.json();

      if (response.ok && result.type === "success") {
        // Clean up stored OTP after successful verification
        otpStorage.delete(email);
        console.log(`✅ MSG91: Email OTP verified successfully for ${email}`);
        return { success: true, message: "OTP verified successfully" };
      } else {
        console.error("❌ MSG91: OTP verification failed:", result);
        return { success: false, message: result.message || "Invalid OTP" };
      }
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