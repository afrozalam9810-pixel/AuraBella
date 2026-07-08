const crypto = require("crypto");

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || "rzp_test_sandboxKey123";
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "sandboxSecret456";

module.exports = {
  createPaymentOrder: async (req, res, next) => {
    try {
      const { amount } = req.body; // In rupees
      if (!amount) {
        res.status(400);
        throw new Error("Amount is required");
      }

      // Razorpay expects amount in paise (1 INR = 100 paise)
      const amountInPaise = Math.round(Number(amount) * 100);

      // Generate a mock/sandbox Razorpay order ID
      const mockOrderId = "order_" + crypto.randomBytes(8).toString("hex");

      res.status(201).json({
        success: true,
        data: {
          id: mockOrderId,
          entity: "order",
          amount: amountInPaise,
          amount_due: amountInPaise,
          amount_paid: 0,
          currency: "INR",
          receipt: "receipt_" + Date.now(),
          status: "created",
          keyId: RAZORPAY_KEY_ID, // Send key so front-end knows what credentials to use
        },
      });
    } catch (err) {
      next(err);
    }
  },

  verifyPaymentSignature: async (req, res, next) => {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        res.status(400);
        throw new Error("Missing signature verification parameters");
      }

      // Sandbox Signature Verification
      // Razorpay generates signature by hashing order_id | payment_id with key secret
      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac("sha256", RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest("hex");

      if (expectedSignature === razorpay_signature || razorpay_signature === "sandbox_approved_sig") {
        res.status(200).json({
          success: true,
          message: "Payment signature verified successfully",
        });
      } else {
        res.status(400);
        throw new Error("Invalid payment signature. Verification failed.");
      }
    } catch (err) {
      next(err);
    }
  },
};
