import Stripe from "stripe";
import jwt from 'jsonwebtoken';
import AdvocateModel from "../model/AdvocateModel.js";
import CaseModel from "../model/CaseModel.js";
import PaymentModel from "../model/PaymentModel.js";

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

const addPayment = async (req, res) => {
    const { case_id, type, amount } = req.body;
    try {
        const newPayment = new PaymentModel({
            case_id,
            type,
            amount,
            status: "Pending", // Default status
            payment_date: new Date()
        });

        await newPayment.save();

        res.status(201).json({ message: "Payment added successfully", payment: newPayment });
    } catch (error) {
        res.json({ success: "false" })
    }
}

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

export { acceptAdvance, paymentUpdate, fetchPaymentByCase, addPayment, acceptSitting, getAllPayments }