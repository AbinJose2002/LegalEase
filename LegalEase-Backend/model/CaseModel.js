import mongoose from 'mongoose';

const caseSchema = new mongoose.Schema({
    case_id: {
        type: String,
        required: true,
        unique: true
    },
    case_title: {
        type: String,
        required: true
    },
    case_description: {
        type: String,
        required: true
    },
    client_id: {
        type: String,
        required: true,
        ref: 'User'  // Assumes you have a User model
    },
    advocate_id: {
        type: String,
        required: true,
        ref: 'Advocate'  // Assumes you have an Advocate model
    },
    status: {
        type: String,
        enum: ['Open', 'In Progress', 'Closed', 'Not Approved'],
        default: 'Not Approved'
    },
    documents: [{
        name: String,
        url: String,
        uploaded_at: {
            type: Date,
            default: Date.now
        }
    }],
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

const CaseModel = mongoose.model('Case', caseSchema);

export default CaseModel;