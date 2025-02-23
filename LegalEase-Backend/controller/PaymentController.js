import Stripe from "stripe";
import AdvocateModel from "../model/AdvocateModel.js";
import CaseModel from "../model/CaseModel.js";

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
            success_url: `http://localhost:5173/advance-payment-success?case_id=${case_id}`,
            cancel_url: `http://localhost:5173/advance-payment-failed`,
        });
        res.status(200).json({ success: true, url: session.url });

    } catch (error) {
        console.error("❌ Stripe Payment Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const paymentUpdate = async (req, res) => {
    // console.log(req.body)
    const caseId = req.body.caseId
    try {
        const updatedCase = await CaseModel.findByIdAndUpdate(
            caseId, // The document ID
            { status: "Open" }, // The fields to update
            { new: true } // Return the updated document
        );
        res.json({success: 'true'})
    } catch (error) {
        res.json({ success: 'false', message: error })
    }
}


export { acceptAdvance, paymentUpdate }