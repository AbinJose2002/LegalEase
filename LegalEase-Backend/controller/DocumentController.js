import Document from '../model/DocumentModel.js'
import Case from '../model/CaseModel.js'
import multer from "multer";
import path from "path";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import fs from 'fs'

dotenv.config();

// Multer storage config (for file uploads)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); // Save files to the `uploads/` folder
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
    }
});

const upload = multer({ storage }).single("file");

// Middleware to extract advocate ID from token
const getAdvocateId = (req) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return null;
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded.id;
    } catch (error) {
        return null;
    }
};

// Get Cases for Logged-in Advocate
export const getCasesForAdvocate = async (req, res) => {
    const advocateId = getAdvocateId(req);
    if (!advocateId) return res.status(401).json({ message: "Unauthorized" });
    
    try {
        const cases = await Case.find({ advocate_id: advocateId });
        res.status(200).json({ cases });
    } catch (error) {
        res.status(500).json({ message: "Error fetching cases", error });
    }
};

// Upload Document
export const uploadDocument = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) return res.status(500).json({ message: "File upload error", err });

        const advocateId = getAdvocateId(req);
        if (!advocateId) return res.status(401).json({ message: "Unauthorized" });

        const { name, caseId } = req.body;
        if (!req.file) return res.status(400).json({ message: "No file uploaded" });

        try {
            const newDocument = new Document({
                caseId,
                advocateId,
                name,
                fileUrl: `/uploads/${req.file.filename}`
            });

            await newDocument.save();
            res.status(201).json({ message: "Document uploaded successfully", document: newDocument });
        } catch (error) {
            res.status(500).json({ message: "Error saving document", error });
        }
    });
};

// Get Documents by Case
export const getDocumentsByCase = async (req, res) => {
    const { caseId } = req.params;

    try {
        const documents = await Document.find({ caseId });
        res.status(200).json({ documents });
    } catch (error) {
        res.status(500).json({ message: "Error fetching documents", error });
    }
};

export const deleteDocument = async (req, res) => {
    try {
        const document = await Document.findById(req.params.id);
        if (!document) return res.status(404).json({ message: "Document not found" });

        // Remove file from server
        const filePath = path.join("uploads", path.basename(document.fileUrl));
        fs.unlink(filePath, (err) => {
            if (err) console.error("Error deleting file:", err);
        });

        await Document.findByIdAndDelete(req.params.id);
        res.json({ message: "Document deleted successfully" });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Error deleting document", error });
    }
};

// Rename Document
export const renameDocument = async (req, res) => {
    try {
        const { name } = req.body;
        await Document.findByIdAndUpdate(req.params.id, { name });
        res.json({ message: "Document renamed successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error renaming document", error });
    }
};