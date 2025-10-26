
import { Router } from "express";
import { db } from "../db";
import { eq, and, desc } from "drizzle-orm";
import { users, wallets, pointsTransactions } from "../../shared/schema";
import { razorpayService } from "../services/razorpayService";
import { pointsService } from "../services/pointsService";

const router = Router();

// Get wallet balance
router.get("/balance", async (req, res) => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const wallet = await pointsService.getOrCreateWallet(userId);
    
    return res.json({
      success: true,
      balance: wallet.balance,
      currency: "WytPoints",
      userId: wallet.userId,
    });
  } catch (error) {
    console.error("Error fetching wallet balance:", error);
    return res.status(500).json({ error: "Failed to fetch wallet balance" });
  }
});

// Get transaction history
router.get("/transactions", async (req, res) => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const transactions = await db
      .select()
      .from(pointsTransactions)
      .where(eq(pointsTransactions.userId, userId))
      .orderBy(desc(pointsTransactions.createdAt))
      .limit(100);

    return res.json({
      success: true,
      transactions: transactions.map(t => ({
        id: t.id,
        type: t.type,
        amount: t.amount,
        description: t.description,
        createdAt: t.createdAt,
        metadata: t.metadata,
      })),
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

// Create points recharge order
router.post("/recharge/create-order", async (req, res) => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { amount, pointsAmount } = req.body;

    if (!amount || !pointsAmount || amount <= 0 || pointsAmount <= 0) {
      return res.status(400).json({ error: "Invalid amount or points" });
    }

    // Create Razorpay order for points recharge
    const result = await razorpayService.createPointsRechargeOrder(userId, {
      amount,
      pointsAmount,
      currency: "INR",
    });

    if (!result.success) {
      return res.status(500).json({ error: result.error || "Failed to create order" });
    }

    return res.json(result.data);
  } catch (error) {
    console.error("Error creating recharge order:", error);
    return res.status(500).json({ error: "Failed to create recharge order" });
  }
});

// Verify and complete points recharge
router.post("/recharge/verify", async (req, res) => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return res.status(400).json({ error: "Missing payment verification data" });
    }

    // Verify and process payment
    const result = await razorpayService.handlePointsRechargeSuccess({
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
    });

    if (!result.success) {
      return res.status(500).json({ error: result.error || "Payment verification failed" });
    }

    return res.json({
      success: true,
      message: "Recharge successful",
      ...result.data,
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return res.status(500).json({ error: "Failed to verify payment" });
  }
});

// Get recharge packages/plans
router.get("/recharge/packages", async (req, res) => {
  try {
    // Predefined recharge packages
    const packages = [
      { id: "starter", name: "Starter Pack", amount: 99, points: 100, bonus: 0, popular: false },
      { id: "basic", name: "Basic Pack", amount: 299, points: 350, bonus: 50, popular: true },
      { id: "standard", name: "Standard Pack", amount: 599, points: 750, bonus: 150, popular: false },
      { id: "premium", name: "Premium Pack", amount: 999, points: 1300, bonus: 300, popular: false },
      { id: "mega", name: "Mega Pack", amount: 1999, points: 2800, bonus: 800, popular: false },
    ];

    return res.json({
      success: true,
      packages,
    });
  } catch (error) {
    console.error("Error fetching packages:", error);
    return res.status(500).json({ error: "Failed to fetch packages" });
  }
});

// Transfer points to another user
router.post("/transfer", async (req, res) => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { recipientId, amount, note } = req.body;

    if (!recipientId || !amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid transfer details" });
    }

    // Check sender's balance
    const senderWallet = await pointsService.getOrCreateWallet(userId);
    if (senderWallet.balance < amount) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    // Verify recipient exists
    const recipient = await db.select().from(users).where(eq(users.id, recipientId)).limit(1);
    if (!recipient[0]) {
      return res.status(404).json({ error: "Recipient not found" });
    }

    // Debit from sender
    await pointsService.debitPoints({
      userId,
      amount,
      type: "transfer_sent",
      description: `Transferred ${amount} points to ${recipient[0].displayName || recipient[0].email}`,
      metadata: { recipientId, note },
    });

    // Credit to recipient
    await pointsService.creditPoints({
      userId: recipientId,
      amount,
      type: "transfer_received",
      description: `Received ${amount} points from ${senderWallet.userId}`,
      metadata: { senderId: userId, note },
    });

    return res.json({
      success: true,
      message: "Transfer successful",
      newBalance: senderWallet.balance - amount,
    });
  } catch (error) {
    console.error("Error transferring points:", error);
    return res.status(500).json({ error: "Failed to transfer points" });
  }
});

export default router;
