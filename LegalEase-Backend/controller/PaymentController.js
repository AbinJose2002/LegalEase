import Stripe from "stripe";
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


export { acceptAdvance, paymentUpdate, fetchPaymentByCase, addPayment, acceptSitting }