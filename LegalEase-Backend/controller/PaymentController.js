import Stripe from "stripe";
import jwt from 'jsonwebtoken';
import AdvocateModel from "../model/AdvocateModel.js";
import CaseModel from "../model/CaseModel.js";
import PaymentModel from "../model/PaymentModel.js";
import { userModal } from '../model/UserModel.js';
import mongoose from 'mongoose';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const acceptAdvance = async (req, res) => {
    const { advocate_id, case_id } = req.body;
    // console.log(req.body)

    try {
        const advocate = await AdvocateModel.findById(advocate_id);
        if (!advocate) {
            return res.status(404).json({ success: false, message: "Advocate not found" });
        }

        const advFee = advocate.advanceFee * 100; // Convert to paise (INR)
        const newPayment = new PaymentModel({
            case_id,
            type: "advance",
            status: "Pending", // Default to Pending if not provided
            amount: advocate.advanceFee,
            payment_date: Date.now() // Default to current date
        });
        const pay = await newPayment.save();
        const payment_id = pay._id.toString()
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: [{
                price_data: {
                    currency: 'inr',
                    product_data: { name: `Advance Fee for ${advocate.firstName}` },
                    unit_amount: advFee
                },
                quantity: 1
            }],
            success_url: `http://localhost:5173/advance-payment-success/advance/${payment_id}/${case_id}`,
            cancel_url: `http://localhost:5173/advance-payment-failed`,
        });
        res.status(200).json({ success: true, url: session.url });

    } catch (error) {
        console.error("❌ Stripe Payment Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const acceptSitting = async (req, res) => {
    const {selectedCase, paymentId} = req.body
    // console.log(selectedCase, paymentId)
    const payment = await PaymentModel.find({_id:paymentId})
    // console.log(payment)
    const payFee = payment[0].amount*100
    // console.log(payFee)
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: [{
            price_data: {
                currency: 'inr',
                product_data: { name: "Sitting Fee" },
                unit_amount: payFee
            },
            quantity: 1
        }],
        success_url: `http://localhost:5173/advance-payment-success/sitting/${paymentId}/${selectedCase}`,
        cancel_url: `http://localhost:5173/advance-payment-failed`,
    });
    res.status(200).json({ success: true, url: session.url });
    try {
        
    } catch (error) {
        res.json({success: "false", error})
    }
}

const paymentUpdate = async (req, res) => {
    const { pay_type, pay_id, case_id } = req.body.case_id
    // console.log(req.body)
    try {
        if (pay_type == 'advance') {
            const updatedCase = await CaseModel.findByIdAndUpdate(
                case_id, // The document ID
                { status: "Open" }, // The fields to update
                { new: true } // Return the updated document
            );
            const updatedFee = await PaymentModel.findByIdAndUpdate(
                pay_id, // The document ID
                { status: "Completed" }, // The fields to update
                { new: true } // Return the updated document
            );
        } else {
            const updatedFee = await PaymentModel.findByIdAndUpdate(
                pay_id, // The document ID
                { status: "Completed" }, // The fields to update
                { new: true } // Return the updated document
            );
        }

        res.json({ success: 'true' })
    } catch (error) {
        console.log(error)
        res.json({ success: 'false', message: error })
    }
}

const fetchPaymentByCase = async (req, res) => {
    const seelectedCaseId = req.body.selectedCaseId
    // console.log(seelectedCaseId)
    try {

        const payments = await PaymentModel.find({ case_id: seelectedCaseId })
        res.json({ success: "true", payments })
    } catch (error) {
        res.json({ success: "false", error })
    }
}

export const addPayment = async (req, res) => {
    try {
        console.log("Payment add request:", req.body);
        
        const { case_id, type, amount, advocate_id } = req.body;
        
        // Input validation
        if (!case_id || !type || !amount) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: case_id, type, and amount are required"
            });
        }

        // Validate case_id format and existence
        if (!mongoose.Types.ObjectId.isValid(case_id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid case ID format"
            });
        }

        const caseExists = await CaseModel.findById(case_id);
        if (!caseExists) {
            return res.status(404).json({
                success: false,
                message: "Case not found"
            });
        }

        // Create a new payment
        const newPayment = new PaymentModel({
            case_id,
            type,
            amount: Number(amount),
            status: "Pending",
            payment_date: new Date(),
            advocate_id: advocate_id || caseExists.advocate_id
        });

        // Save to database
        const savedPayment = await newPayment.save();
        console.log("Payment saved successfully:", savedPayment);

        return res.status(201).json({
            success: true,
            message: "Payment added successfully",
            payment: savedPayment
        });
    } catch (error) {
        console.error("Error adding payment:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while adding payment",
            error: error.message
        });
    }
};

export const handleStripeWebhook = async (req, res) => {
    const sig = req.headers["stripe-signature"];

    try {
        const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);

        if (event.type === "checkout.session.completed") {
            const session = event.data.object;

            // Find payment record
            const payment = await PaymentModel.findOne({ stripePaymentId: session.id });

            if (payment) {
                // Update payment status
                payment.status = "Completed";
                await payment.save();

                // Update consultation status to "Paid"
                await ConsultationModel.findByIdAndUpdate(payment.case_id, { status: "Paid" });

                console.log("✅ Payment successful for consultation:", payment.case_id);
            }
        }

        res.json({ received: true });
    } catch (err) {
        console.error("⚠️ Webhook Error:", err);
        res.status(400).send(`Webhook Error: ${err.message}`);
    }
};

const getAllPayments = async (req, res) => {
    try {
        const payments = await PaymentModel.find();
        res.json({ success: true, data: payments });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching payments" });
    }
};

export const getAdvocateEarnings = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(401).json({
                success: "false",
                message: "No token provided"
            });
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get all cases for this advocate
        const cases = await CaseModel.find({ advocate_id: decodedToken.id });
        if (!cases || cases.length === 0) {
            return res.json({
                success: "true",
                totalEarnings: 0,
                payments: []
            });
        }

        // Convert cases ObjectIds to strings for comparison
        const caseIds = cases.map(c => c._id);

        // Get all completed payments for these cases
        const payments = await PaymentModel.find({
            case_id: { $in: caseIds.map(id => id.toString()) },
            status: "Completed"
        });

        // Calculate total earnings safely
        const totalEarnings = payments.reduce((sum, payment) => {
            const amount = Number(payment.amount) || 0;
            return sum + amount;
        }, 0);

        console.log({
            advocateId: decodedToken.id,
            casesFound: cases.length,
            paymentsFound: payments.length,
            totalEarnings
        });

        res.json({
            success: "true",
            totalEarnings,
            payments
        });
    } catch (error) {
        console.error('Error in getAdvocateEarnings:', error);
        res.status(500).json({
            success: "false",
            message: "Error fetching earnings",
            error: error.message || "Unknown error occurred"
        });
    }
};

export const getAdvocatePendingPayments = async (req, res) => {
    try {
        const { advocateId } = req.params;
        
        // Validate the advocate ID
        if (!advocateId) {
            return res.status(400).json({
                success: false,
                message: "Advocate ID is required"
            });
        }
        
        // Find all pending payments for this advocate
        const pendingPayments = await PaymentModel.find({
            advocate_id: advocateId,
            status: 'pending'
        }).populate('case_id client_id');
        
        console.log(`Found ${pendingPayments.length} pending payments for advocate ${advocateId}`);
        
        // Format the response
        const formattedPayments = await Promise.all(pendingPayments.map(async payment => {
            // Get client details
            const client = await userModal.findById(payment.client_id);
            
            return {
                id: payment._id,
                caseId: payment.case_id._id,
                caseTitle: payment.case_id.case_title,
                caseNumber: payment.case_id.case_id,
                clientName: client ? `${client.firstName} ${client.lastName}` : 'Unknown Client',
                amount: payment.amount,
                type: payment.type,
                status: payment.status,
                description: payment.description,
                createdAt: payment.createdAt
            };
        }));
        
        return res.status(200).json({
            success: true,
            count: formattedPayments.length,
            data: formattedPayments
        });
    } catch (error) {
        console.error("Error fetching advocate pending payments:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching pending payments",
            error: error.message
        });
    }
};

export const advancePayment = async (req, res) => {
    try {
        // Implementation of the advancePayment function
        // This is a placeholder that you can customize based on requirements
        const { caseId, amount } = req.body;
        
        if (!caseId || !amount) {
            return res.status(400).json({
                success: false,
                message: "Case ID and amount are required"
            });
        }
        
        // Check if case exists
        const caseExists = await CaseModel.findById(caseId);
        if (!caseExists) {
            return res.status(404).json({
                success: false,
                message: "Case not found"
            });
        }
        
        // Create a new payment record
        const newPayment = new PaymentModel({
            case_id: caseId,
            advocate_id: caseExists.advocate_id,
            type: 'Advance',
            amount: Number(amount),
            status: 'Pending',
            payment_date: new Date()
        });
        
        const savedPayment = await newPayment.save();
        
        return res.status(201).json({
            success: true,
            message: "Advance payment initiated",
            payment: savedPayment
        });
    } catch (error) {
        console.error("Error in advancePayment:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while processing advance payment",
            error: error.message
        });
    }
};

export const fetchPayment = async (req, res) => {
    // ...existing code...
};

export const fetchCasePayment = async (req, res) => {
    // ...existing code...
};

export const cancelPayment = async (req, res) => {
    try {
        const { paymentId } = req.params;
        const { reason } = req.body;
        
        console.log(`Payment cancellation requested for payment ID: ${paymentId}`);
        console.log(`Reason: ${reason || 'Not provided'}`);
        
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
        
        // Only cancel if the payment is not already completed
        if (payment.status === 'Completed') {
            return res.status(400).json({
                success: false,
                message: "Cannot cancel a completed payment"
            });
        }
        
        // Update payment status to Cancelled
        payment.status = 'Cancelled';
        await payment.save();
        
        console.log(`Payment ${paymentId} marked as cancelled`);
        
        return res.status(200).json({
            success: true,
            message: "Payment cancelled successfully"
        });
    } catch (error) {
        console.error("Error cancelling payment:", error);
        return res.status(500).json({
            success: false,
            message: "Error cancelling payment",
            error: error.message
        });
    }
};

export const successPayment = async (req, res) => {
    try {
        const { paymentId } = req.params;
        const { sessionId, caseId } = req.body;
        
        console.log(`Payment success called for paymentId: ${paymentId}`);
        console.log(`Session ID: ${sessionId}`);
        console.log(`Case ID: ${caseId}`);
        
        if (!paymentId) {
            return res.status(400).json({
                success: false,
                message: "Payment ID is required"
            });
        }
        
        // Validate payment record exists
        const payment = await PaymentModel.findById(paymentId);
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: "Payment not found"
            });
        }
        
        // Check if payment is already completed to prevent double processing
        if (payment.status === 'Completed') {
            // Payment already processed, return success with existing payment details
            return res.status(200).json({
                success: true,
                message: "Payment already marked as completed",
                payment
            });
        }
        
        // Update payment status to Completed
        payment.status = 'Completed';
        payment.payment_id = sessionId || 'manual-' + Date.now();
        await payment.save();
        
        console.log(`Payment ${paymentId} marked as completed`);
        
        return res.status(200).json({
            success: true,
            message: "Payment completed successfully",
            payment
        });
    } catch (error) {
        console.error("Error processing payment success:", error);
        return res.status(500).json({
            success: false,
            message: "Error processing payment success",
            error: error.message
        });
    }
};

export default {
    advancePayment,
    fetchPayment,
    fetchCasePayment,
    cancelPayment,
    successPayment,
    getAdvocatePendingPayments,
    addPayment
};

export { acceptAdvance, paymentUpdate, fetchPaymentByCase, acceptSitting, getAllPayments }