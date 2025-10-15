import Razorpay from "razorpay";
import { db } from "../db";
import { orders, payments, plans, users, subscriptions } from "../../shared/schema";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";

interface OrderItem {
  name: string;
  description?: string;
  amount: number;
  currency: string;
  quantity: number;
}

interface CreateOrderData {
  amount: number;
  currency?: string;
  receipt?: string;
  notes?: Record<string, any>;
  items?: OrderItem[];
  planId?: string;
}

interface PaymentVerificationData {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export class RazorpayService {
  private razorpay: Razorpay;
  private keyId: string;
  private keySecret: string;

  constructor() {
    this.keyId = process.env.RAZORPAY_KEY_ID || "";
    this.keySecret = process.env.RAZORPAY_KEY_SECRET || "";
    
    if (!this.keyId || !this.keySecret) {
      throw new Error("Razorpay credentials not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.");
    }

    this.razorpay = new Razorpay({
      key_id: this.keyId,
      key_secret: this.keySecret,
    });

    console.log("🔧 Razorpay service initialized successfully");
  }

  /**
   * Create a new order in the database and Razorpay
   */
  async createOrder(userId: string, orderData: CreateOrderData): Promise<{
    success: boolean;
    data?: {
      orderId: string;
      razorpayOrderId: string;
      amount: number;
      currency: string;
      key: string;
    };
    error?: string;
  }> {
    try {
      // Get user details
      const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (!user[0]) {
        return { success: false, error: "User not found" };
      }

      // Generate order number
      const orderNumber = `WYT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      // Calculate totals
      const subtotal = orderData.amount;
      const tax = 0; // Add tax calculation if needed
      const discount = 0; // Add discount calculation if needed
      const total = subtotal + tax - discount;

      // Create order in database
      const dbOrderResult = await db.insert(orders).values({
        tenantId: user[0].tenantId,
        userId: userId,
        planId: orderData.planId,
        orderNumber,
        status: 'pending',
        subtotal: subtotal.toString(),
        tax: tax.toString(),
        discount: discount.toString(),
        total: total.toString(),
        currency: orderData.currency || 'INR',
        items: orderData.items || [],
        metadata: orderData.notes || {},
      }).returning({ id: orders.id });

      const dbOrderId = dbOrderResult[0].id;

      // Create order in Razorpay
      const razorpayOrder = await this.razorpay.orders.create({
        amount: Math.round(total * 100), // Convert to paisa
        currency: orderData.currency || 'INR',
        receipt: orderData.receipt || orderNumber,
        notes: {
          orderId: dbOrderId,
          userId: userId,
          ...orderData.notes,
        },
      });

      // Create payment record
      await db.insert(payments).values({
        tenantId: user[0].tenantId,
        userId: userId,
        orderId: dbOrderId,
        provider: 'razorpay',
        providerOrderId: razorpayOrder.id,
        amount: total.toString(),
        currency: orderData.currency || 'INR',
        status: 'pending',
        receipt: orderData.receipt || orderNumber,
        notes: orderData.notes || {},
      });

      console.log(`✅ Razorpay: Order created successfully - DB ID: ${dbOrderId}, Razorpay ID: ${razorpayOrder.id}`);

      return {
        success: true,
        data: {
          orderId: dbOrderId,
          razorpayOrderId: razorpayOrder.id,
          amount: total,
          currency: orderData.currency || 'INR',
          key: this.keyId,
        },
      };
    } catch (error) {
      console.error("❌ Razorpay: Failed to create order:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to create order"
      };
    }
  }

  /**
   * Verify payment signature from Razorpay
   */
  verifyPaymentSignature(data: PaymentVerificationData): boolean {
    try {
      const body = data.razorpay_order_id + "|" + data.razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac("sha256", this.keySecret)
        .update(body.toString())
        .digest("hex");

      return expectedSignature === data.razorpay_signature;
    } catch (error) {
      console.error("❌ Razorpay: Signature verification failed:", error);
      return false;
    }
  }

  /**
   * Handle successful payment
   */
  async handlePaymentSuccess(data: PaymentVerificationData): Promise<{
    success: boolean;
    data?: {
      paymentId: string;
      orderId: string;
      amount: number;
    };
    error?: string;
  }> {
    try {
      // Verify signature first
      if (!this.verifyPaymentSignature(data)) {
        return { success: false, error: "Invalid payment signature" };
      }

      // Get payment details from Razorpay
      const razorpayPayment = await this.razorpay.payments.fetch(data.razorpay_payment_id);
      
      // Find our payment record
      const paymentRecord = await db.select()
        .from(payments)
        .where(eq(payments.providerOrderId, data.razorpay_order_id))
        .limit(1);

      if (!paymentRecord[0]) {
        return { success: false, error: "Payment record not found" };
      }

      // Update payment status
      await db.update(payments)
        .set({
          providerPaymentId: data.razorpay_payment_id,
          status: 'completed',
          method: razorpayPayment.method,
          paymentMethod: razorpayPayment as any,
          paidAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(payments.id, paymentRecord[0].id));

      // Update order status
      await db.update(orders)
        .set({
          status: 'confirmed',
          updatedAt: new Date(),
        })
        .where(eq(orders.id, paymentRecord[0].orderId!));

      console.log(`✅ Razorpay: Payment completed successfully - Payment ID: ${data.razorpay_payment_id}`);

      return {
        success: true,
        data: {
          paymentId: data.razorpay_payment_id,
          orderId: paymentRecord[0].orderId!,
          amount: parseFloat(paymentRecord[0].amount),
        },
      };
    } catch (error) {
      console.error("❌ Razorpay: Failed to handle payment success:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to process payment"
      };
    }
  }

  /**
   * Handle failed payment
   */
  async handlePaymentFailure(paymentId: string, reason?: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      // Update payment status
      await db.update(payments)
        .set({
          status: 'failed',
          failureReason: reason,
          failedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(payments.providerPaymentId, paymentId));

      console.log(`❌ Razorpay: Payment failed - Payment ID: ${paymentId}, Reason: ${reason}`);

      return { success: true };
    } catch (error) {
      console.error("❌ Razorpay: Failed to handle payment failure:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to process payment failure"
      };
    }
  }

  /**
   * Get payment details
   */
  async getPayment(paymentId: string): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    try {
      const payment = await db.select()
        .from(payments)
        .where(eq(payments.id, paymentId))
        .limit(1);

      if (!payment[0]) {
        return { success: false, error: "Payment not found" };
      }

      return { success: true, data: payment[0] };
    } catch (error) {
      console.error("❌ Razorpay: Failed to get payment:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to get payment"
      };
    }
  }

  /**
   * Get user's payment history
   */
  async getPaymentHistory(userId: string): Promise<{
    success: boolean;
    data?: any[];
    error?: string;
  }> {
    try {
      const paymentHistory = await db.select()
        .from(payments)
        .where(eq(payments.userId, userId))
        .orderBy(payments.createdAt);

      return { success: true, data: paymentHistory };
    } catch (error) {
      console.error("❌ Razorpay: Failed to get payment history:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to get payment history"
      };
    }
  }

  /**
   * Refund a payment
   */
  async refundPayment(paymentId: string, amount?: number, reason?: string): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    try {
      // Get payment record
      const paymentRecord = await db.select()
        .from(payments)
        .where(eq(payments.id, paymentId))
        .limit(1);

      if (!paymentRecord[0] || !paymentRecord[0].providerPaymentId) {
        return { success: false, error: "Payment not found" };
      }

      // Create refund in Razorpay
      const refundAmount = amount ? Math.round(amount * 100) : undefined;
      const refund = await this.razorpay.payments.refund(paymentRecord[0].providerPaymentId, {
        amount: refundAmount,
        notes: { reason: reason || "Customer requested refund" },
      });

      // Update payment status
      await db.update(payments)
        .set({
          status: 'refunded',
          refundedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(payments.id, paymentId));

      console.log(`✅ Razorpay: Refund processed successfully - Refund ID: ${refund.id}`);

      return { success: true, data: refund };
    } catch (error) {
      console.error("❌ Razorpay: Failed to process refund:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to process refund"
      };
    }
  }

  /**
   * Get available plans
   */
  async getPlans(): Promise<{
    success: boolean;
    data?: any[];
    error?: string;
  }> {
    try {
      const plansList = await db.select()
        .from(plans)
        .where(eq(plans.isActive, true));

      return { success: true, data: plansList };
    } catch (error) {
      console.error("❌ Razorpay: Failed to get plans:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to get plans"
      };
    }
  }

  /**
   * Create a payment link
   */
  async createPaymentLink(data: {
    amount: number;
    currency?: string;
    description?: string;
    customerName?: string;
    customerEmail?: string;
    customerContact?: string;
    reference_id?: string;
    notes?: Record<string, any>;
  }): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    try {
      const paymentLink = await this.razorpay.paymentLink.create({
        amount: Math.round(data.amount * 100), // Convert to paisa
        currency: data.currency || 'INR',
        description: data.description || 'Payment',
        customer: {
          name: data.customerName,
          email: data.customerEmail,
          contact: data.customerContact,
        },
        notify: {
          sms: true,
          email: true,
        },
        reminder_enable: true,
        reference_id: data.reference_id || `WYT-PL-${Date.now()}`,
        notes: data.notes || {},
        callback_url: `${process.env.REPL_SLUG ? `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co` : 'https://wytnet.com'}/payment-success`,
        callback_method: 'get',
      });

      console.log(`✅ Razorpay: Payment link created successfully - ${paymentLink.short_url}`);

      return { success: true, data: paymentLink };
    } catch (error) {
      console.error("❌ Razorpay: Failed to create payment link:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to create payment link"
      };
    }
  }

  /**
   * Get payment link details
   */
  async getPaymentLink(paymentLinkId: string): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    try {
      const paymentLink = await this.razorpay.paymentLink.fetch(paymentLinkId);
      return { success: true, data: paymentLink };
    } catch (error) {
      console.error("❌ Razorpay: Failed to get payment link:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to get payment link"
      };
    }
  }

  // ========================================
  // WYTPOINTS RECHARGE METHODS
  // ========================================

  /**
   * Create a WytPoints recharge order
   */
  async createPointsRechargeOrder(userId: string, data: {
    amount: number; // Amount in rupees
    pointsAmount: number; // Number of points to credit
    currency?: string;
  }): Promise<{
    success: boolean;
    data?: {
      orderId: string;
      razorpayOrderId: string;
      amount: number;
      pointsAmount: number;
      currency: string;
      key: string;
    };
    error?: string;
  }> {
    try {
      // Get user details - WhatsApp users only
      const user = await db.select().from(whatsappUsers).where(eq(whatsappUsers.id, userId)).limit(1);
      if (!user[0]) {
        return { success: false, error: "WytPoints are only available for WhatsApp-authenticated users" };
      }

      // Generate order number
      const orderNumber = `WYT-POINTS-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      const currency = data.currency || 'INR';

      // Create order in database
      const dbOrderResult = await db.insert(orders).values({
        tenantId: user[0].tenantId!,
        userId: userId,
        orderNumber,
        status: 'pending',
        subtotal: data.amount.toString(),
        tax: '0',
        discount: '0',
        total: data.amount.toString(),
        currency,
        items: [{
          name: `${data.pointsAmount} WytPoints`,
          description: 'WytPoints recharge',
          amount: data.amount,
          currency,
          quantity: 1,
        }],
        metadata: {
          orderType: 'points_recharge',
          pointsAmount: data.pointsAmount,
        },
      }).returning({ id: orders.id });

      const dbOrderId = dbOrderResult[0].id;

      // Create order in Razorpay
      const razorpayOrder = await this.razorpay.orders.create({
        amount: Math.round(data.amount * 100), // Convert to paisa
        currency,
        receipt: orderNumber,
        notes: {
          orderId: dbOrderId,
          userId: userId,
          orderType: 'points_recharge',
          pointsAmount: data.pointsAmount,
        },
      });

      // Create payment record
      await db.insert(payments).values({
        tenantId: user[0].tenantId!,
        userId: userId,
        orderId: dbOrderId,
        provider: 'razorpay',
        providerOrderId: razorpayOrder.id,
        amount: data.amount.toString(),
        currency,
        status: 'pending',
        receipt: orderNumber,
        notes: {
          orderType: 'points_recharge',
          pointsAmount: data.pointsAmount,
        },
      });

      console.log(`✅ Razorpay: Points recharge order created - Order ID: ${dbOrderId}, Points: ${data.pointsAmount}`);

      return {
        success: true,
        data: {
          orderId: dbOrderId,
          razorpayOrderId: razorpayOrder.id,
          amount: data.amount,
          pointsAmount: data.pointsAmount,
          currency,
          key: this.keyId,
        },
      };
    } catch (error) {
      console.error("❌ Razorpay: Failed to create points recharge order:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to create points recharge order"
      };
    }
  }

  /**
   * Handle successful points recharge payment
   */
  async handlePointsRechargeSuccess(data: PaymentVerificationData): Promise<{
    success: boolean;
    data?: {
      paymentId: string;
      orderId: string;
      amount: number;
      pointsAmount: number;
      newBalance: number;
    };
    error?: string;
  }> {
    try {
      // Import PointsService dynamically to avoid circular dependency
      const { pointsService } = await import('./pointsService');

      // Verify signature first
      if (!this.verifyPaymentSignature(data)) {
        return { success: false, error: "Invalid payment signature" };
      }

      // Get payment details from Razorpay
      const razorpayPayment = await this.razorpay.payments.fetch(data.razorpay_payment_id);
      
      // Find our payment record
      const paymentRecord = await db.select()
        .from(payments)
        .where(eq(payments.providerOrderId, data.razorpay_order_id))
        .limit(1);

      if (!paymentRecord[0]) {
        return { success: false, error: "Payment record not found" };
      }

      // Verify orderId and userId exist
      if (!paymentRecord[0].orderId) {
        return { success: false, error: "Payment record missing order ID" };
      }

      if (!paymentRecord[0].userId) {
        return { success: false, error: "Payment record missing user ID" };
      }

      const orderId = paymentRecord[0].orderId;
      const userId = paymentRecord[0].userId;

      // Get order details
      const orderRecord = await db.select()
        .from(orders)
        .where(eq(orders.id, orderId))
        .limit(1);

      if (!orderRecord[0]) {
        return { success: false, error: "Order record not found" };
      }

      // Verify this is a points recharge order
      const metadata = orderRecord[0].metadata as any;
      if (metadata?.orderType !== 'points_recharge' || !metadata?.pointsAmount) {
        return { success: false, error: "Invalid order type for points recharge" };
      }

      const pointsAmount = metadata.pointsAmount;

      // Update payment status
      await db.update(payments)
        .set({
          providerPaymentId: data.razorpay_payment_id,
          status: 'completed',
          method: razorpayPayment.method,
          paymentMethod: razorpayPayment as any,
          paidAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(payments.id, paymentRecord[0].id));

      // Update order status
      await db.update(orders)
        .set({
          status: 'confirmed',
          updatedAt: new Date(),
        })
        .where(eq(orders.id, orderId));

      // Credit points to user's wallet
      const wallet = await pointsService.creditPoints({
        userId,
        amount: pointsAmount,
        type: 'recharge',
        description: `Recharged ${pointsAmount} points via Razorpay payment`,
        metadata: {
          orderId,
          paymentId: data.razorpay_payment_id,
          razorpayOrderId: data.razorpay_order_id,
          amountPaid: parseFloat(paymentRecord[0].amount),
          currency: paymentRecord[0].currency,
        },
      });

      console.log(`✅ Razorpay: Points recharge completed - User: ${userId}, Points: ${pointsAmount}, New Balance: ${wallet.balance}`);

      return {
        success: true,
        data: {
          paymentId: data.razorpay_payment_id,
          orderId,
          amount: parseFloat(paymentRecord[0].amount),
          pointsAmount,
          newBalance: wallet.balance,
        },
      };
    } catch (error) {
      console.error("❌ Razorpay: Failed to handle points recharge success:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to process points recharge"
      };
    }
  }
}

// Export singleton instance
export const razorpayService = new RazorpayService();