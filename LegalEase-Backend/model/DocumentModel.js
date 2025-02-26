import mongoose from "mongoose";

const documentSchema = new mongoose.Schema({
    caseId: { type: mongoose.Schema.Types.ObjectId, ref: "Case", required: true },
    advocateId: { type: mongoose.Schema.Types.ObjectId, ref: "Advocate", required: true },
    name: { type: String, required: true },
    fileUrl: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now }
});

const DocumentModel = mongoose.model("Document", documentSchema);

export default DocumentModel
