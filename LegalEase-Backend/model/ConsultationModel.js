import mongoose from "mongoose";

const consultationSchema = new mongoose.Schema({
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    advocateId: { type: mongoose.Schema.Types.ObjectId, ref: "advocate", required: true },
    date: { type: String, required: true }, // Storing date as string (YYYY-MM-DD format)
    timeSlot: { type: String, required: true }, // Example: "10:00 to 10:30"
    status: { type: String, enum: ["Pending", "Accepted", "Rejected", "Paid", "Scheduled"], default: "Pending" },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
    meetingLink: { type: String }, // Video meeting link (Google Meet, Zoom, etc.)
    createdAt: { type: Date, default: Date.now }
});

const ConsultationModel = mongoose.model("Consultation", consultationSchema);
export default ConsultationModel;
