import mongoose from 'mongoose';

const advocateSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
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
    type: String
  },
  specialization: {
    type: Array,
    required: true
  },
  experience: {
    type: Number,
    required: true,
    default: 0
  },
  image: {
    type: String
  },
  advanceFee: {
    type: Number,
    required: true
  },
  sittingFee: {
    type: Number,
    required: true
  },
  consultationFee: {
    type: Number,
    required: true
  },
  verified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Advocate = mongoose.model('Advocate', advocateSchema);

export default Advocate;