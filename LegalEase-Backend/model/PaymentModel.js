import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
    case_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Case',
        required: true
    },
    advocate_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Advocate',
        required: true
    },
    type: {
        type: String, 
        enum: ['Advance', 'Sitting', 'Consultation', 'Other'],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Completed', 'Cancelled'],
        default: 'Pending'
    },
    payment_id: {
        type: String,
    },
    payment_date: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

export default mongoose.model('Payment', paymentSchema);
