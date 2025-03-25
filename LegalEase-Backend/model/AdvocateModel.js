import mongoose from "mongoose";

const advocateSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    specialization: {
        type: Array,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    password: {  
        type: String,
        required: true
    },
    bio: {
        type: String,
        required: true
    },
    sittingFee: {
        type: Number,
        required: true
    },
    advanceFee: {
        type: Number,
        required: true
    },
    consultationFee: {
        type: Number,
        required: true
    },
    experience: {
        type: Number,  // Changed from String to Number
        required: true
    },
    image: {
        type: String
    },
    verified:{type: Boolean, default: false},
    created_at: {
        type: Date,
        default: Date.now 
    }
}, { timestamps: false }); 

const AdvocateModel = mongoose.model('advocate', advocateSchema);
export default AdvocateModel