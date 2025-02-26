import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    advocateId: { type: mongoose.Schema.Types.ObjectId, ref: "Advocate", required: true },
    createdAt: { type: Date, default: Date.now }
});

const BlogModel = mongoose.model("Blog", blogSchema);

export default BlogModel
