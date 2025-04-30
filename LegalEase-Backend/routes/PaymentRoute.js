import express from 'express';
import { 
    fetchPayment,
    fetchCasePayment,
    cancelPayment,
    successPayment,
    getAdvocatePendingPayments,
    addPayment
} from '../controller/PaymentController.js';
import PaymentModel from '../model/PaymentModel.js';
import CaseModel from '../model/CaseModel.js';
import stripe from '../config/stripe.js';

const router = express.Router();

// Existing routes
router.post('/fetch', fetchPayment);
router.post('/fetch-case', fetchCasePayment);
router.post('/add', addPayment);
router.post('/cancel/:paymentId', cancelPayment);
router.post('/success/:paymentId', successPayment);
router.get('/advocate/:advocateId/pending', getAdvocatePendingPayments);

// Add a unified payment processing endpoint
router.post('/process', async (req, res) => {
  try {
    console.log("Payment process request received:", req.body);
    
    const { paymentId, caseId } = req.body;
    
    if (!paymentId) {
      return res.status(400).json({
        success: false,
        message: "Payment ID is required"
      });
    }
    
    // Find the payment
    const payment = await PaymentModel.findById(paymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found"
      });
    }
    
    // Find the case to get more details
    const caseData = await CaseModel.findById(payment.case_id);
    if (!caseData) {
      return res.status(404).json({
        success: false,
        message: "Associated case not found"
      });
    }
    
    console.log("Creating Stripe session for payment:", payment);
    
    // Create a Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: `${payment.type} Fee for Case ${caseData.case_title || caseData.case_id || payment.case_id}`,
              description: `Payment for legal services (${payment.type})`,
            },
            unit_amount: Math.round(payment.amount * 100), // Convert to cents/paise
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `http://localhost:5173/payment-success?payment_id=${payment._id}`,
      cancel_url: `http://localhost:5173/payment-failed?payment_id=${payment._id}`,
      metadata: {
        payment_id: payment._id.toString(),
        case_id: payment.case_id.toString(),
        payment_type: payment.type
      }
    });
    
    console.log("Stripe session created:", session.id);
    
    // Return the session URL for redirection
    return res.status(200).json({
      success: true,
      url: session.url,
      payment_id: payment._id
    });
  } catch (error) {
    console.error("Error processing payment:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while processing payment",
      error: error.message
    });
  }
});

export default router;