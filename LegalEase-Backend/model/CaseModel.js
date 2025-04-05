import mongoose from "mongoose";

const caseSchema = new mongoose.Schema({
  case_id: { 
    type: String,
    unique: true,
    sparse: true // This allows documents without case_id while maintaining uniqueness
  },
  client_id: { 
    type: String, 
    required: true  
  },
  advocate_id: { 
    type: String,
    required: true 
  },
  case_title: { 
    type: String, 
    required: true 
  },
  case_description: { 
    type: String 
  },
  caseType: {
    type: String,
    enum: ['criminal', 'civil', 'family', 'business', 'property', 'other'],
    required: true
  },
  status: { 
    type: String, 
    enum: ['Not Approved', 'Open', 'In Progress', 'Closed'], 
    default: 'Not Approved' 
  },
  created_at: { 
    type: Date, 
    default: Date.now 
  }
});

const CaseModel = mongoose.model('Case', caseSchema);
export default CaseModel