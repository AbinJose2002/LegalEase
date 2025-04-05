import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    caseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Case',
        required: true
    },
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',  // Change 'User' to 'user' to match the model name
        required: true
    },
    advocateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'advocate',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    review: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const ReviewModel = mongoose.model('Review', reviewSchema);
export default ReviewModel;
