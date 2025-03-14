import mongoose from "mongoose";

const paySchema = new mongoose.Schema({
    case_id: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ["advance", "Sitting", "Consultation"], 
        required: true
    },
    status: {
        type: String,
        enum: ["Pending", "Completed", "Failed"],
        default: "Pending"
    },
    amount: {
        type: Number,
        required: true
    },
    payment_date: {
        type: Date,
        default: Date.now
    }
});

const PaymentModel = mongoose.model("payment", paySchema)

export default PaymentModel
