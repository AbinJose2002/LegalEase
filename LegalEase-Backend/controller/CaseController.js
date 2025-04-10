import CaseModel from '../model/CaseModel.js'
import { userModal } from '../model/UserModel.js';
import jwt from 'jsonwebtoken';

import dotenv from 'dotenv'
import DocumentModel from '../model/DocumentModel.js';
dotenv.config()

const submitCase = async (req, res) => {
    console.log("Case submission request received:", req.body);
    
    try {
        const { caseName, caseDesc, advocate, client_id, caseType } = req.body.caseDetails || {};

        // Debug the received data with more detail
        console.log("Received fields:", {
            caseName: caseName,
            caseDesc: caseDesc,
            advocate: advocate?._id || 'NO ADVOCATE', 
            client_id: client_id ? 'PRESENT' : 'MISSING',
            caseType: caseType || 'MISSING',
            rawCaseType: typeof caseType, // Log the actual type
            entirePayload: JSON.stringify(req.body) // Log the entire payload
        });

        // Validate required fields
        if (!caseName) {
            return res.status(400).json({ success: "false", message: "Case title is required" });
        }
        
        if (!advocate || !advocate._id) {
            return res.status(400).json({ success: "false", message: "Advocate information is required" });
        }
        
        if (!client_id) {
            return res.status(400).json({ success: "false", message: "Client ID is required" });
        }

        // Critical validation for caseType with fallback
        let finalCaseType = caseType;
        if (!finalCaseType) {
            console.warn("caseType is missing from submission, defaulting to 'civil'");
            finalCaseType = 'civil'; // Default value if missing
        }

        // Make sure it's one of the allowed types
        const allowedTypes = ['criminal', 'civil', 'family', 'business', 'property', 'other'];
        if (!allowedTypes.includes(finalCaseType)) {
            console.warn(`Invalid caseType '${finalCaseType}', defaulting to 'civil'`);
            finalCaseType = 'civil';
        }

        // Decode client token
        let clientToken;
        try {
            const decodedToken = jwt.verify(client_id, process.env.JWT_SECRET);
            clientToken = decodedToken.id;
            if (!clientToken) {
                return res.status(404).json({ success: "false", message: "Invalid client token" });
            }
        } catch (tokenError) {
            console.error("Token verification error:", tokenError);
            return res.status(401).json({ 
                success: "false", 
                message: "Invalid or expired token. Please login again." 
            });
        }

        // Create case with required caseType
        const newCase = new CaseModel({
            case_id: `TEMP${Date.now()}`,
            client_id: clientToken,
            advocate_id: advocate._id,
            case_title: caseName,
            case_description: caseDesc || '',
            caseType: finalCaseType, // Use our validated caseType value
            status: 'Not Approved'
        });
        
        // Log before saving for debugging
        console.log("About to save case with data:", {
            case_title: newCase.case_title,
            advocate_id: newCase.advocate_id,
            caseType: newCase.caseType // Log to verify caseType is set
        });
        
        const savedCase = await newCase.save();
        
        res.json({ 
            success: "true", 
            message: "Case submitted successfully",
            caseId: savedCase._id
        });
    } catch (error) {
        console.error("Case submission error:", error);
        
        // Enhanced error response
        res.status(500).json({ 
            success: "false", 
            message: error.message || "Internal server error",
            details: error.errors ? Object.keys(error.errors).map(key => ({
                field: key,
                message: error.errors[key].message
            })) : null
        });
    }
}

const fetchCase = async (req, res) => {
    try {
        const advToken = req.body.advToken;
        const decodedToken = jwt.verify(advToken, process.env.JWT_SECRET);

        // Fetch clients where advocate_id matches
        let clients = await CaseModel.find({
            $or: [
              { advocate_id: decodedToken.id },
              { client_id: decodedToken.id }
            ]
          });
          
        // Fetch user details for each client
        for (let i = 0; i < clients.length; i++) {
            const user = await userModal.findById(clients[i].client_id);
            clients[i] = clients[i].toObject(); // Convert Mongoose document to plain object
            clients[i].userDetails = user ? user.toObject() : null; // Append user data
        }
        res.json({ success: "true", clients });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: "false", message: "Internal Server Error!!" });
    }
};

const fetchCaseUser = async (req, res) => {
    try {
        const advToken = req.body.advToken;
        const decodedToken = jwt.verify(advToken, process.env.JWT_SECRET);
        
        // Fetch clients where advocate_id matches
        let clients = await CaseModel.find({ client_id: decodedToken.id });
        
        // Fetch user details for each client
        for (let i = 0; i < clients.length; i++) {
            const user = await userModal.findById(clients[i].client_id);
            clients[i] = clients[i].toObject(); // Convert Mongoose document to plain object
            clients[i].userDetails = user ? user.toObject() : null; // Append user data
        }

        res.json({ success: "true", clients });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: "false", message: "Internal Server Error!!" });
    }
};

export const caseConfirm = async (req, res) => {
    const { caseNum, case_id, caseType } = req.body;
    console.log("Received case data:", { caseNum, case_id, caseType });

    try {
        if (!caseType) {
            return res.status(400).json({
                success: "false",
                message: "Case type is required"
            });
        }

        const updatedCase = await CaseModel.findByIdAndUpdate(
            caseNum,
            { 
                case_id: case_id,
                status: "Open",
                caseType: caseType 
            },
            { new: true }
        );

        if (!updatedCase) {
            return res.status(404).json({
                success: "false",
                message: "Case not found"
            });
        }

        res.json({ success: "true", case: updatedCase });
    } catch (error) {
        console.error("Case confirmation error:", error);
        res.status(500).json({
            success: "false",
            message: error.message || "Error confirming case"
        });
    }
};

const caseReject = async (req, res) => {
    try {
        const caseNum = req.body.caseNum
        // console.log(caseNum)
        const caseDetail = await CaseModel.findOne({ _id: caseNum });

        await caseDetail.deleteOne()

        res.json({success:"true"})
    } catch (error) {
        res.json({ success: 'false', message: "Case confirmed Unsuccess" })
    }
}

const getUserId = (req) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return null;
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded.id;
    } catch (error) {
        return null;
    }
};

// Get Cases Assigned to the User
export const getCasesForUser = async (req, res) => {
    try {
        const { token } = req.body;
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        
        const cases = await CaseModel.find({ 
            client_id: decodedToken.id,
            status: 'Closed'
        }).populate('advocate_id');

        res.json({
            success: "true",
            cases
        });
    } catch (error) {
        console.error('Error fetching user cases:', error);
        res.status(500).json({
            success: "false",
            message: "Error fetching cases",
            error: error.message
        });
    }
};

// Get Documents for Selected Case
export const getDocumentsForUser = async (req, res) => {
    const { caseId } = req.params;

    try {
        const documents = await DocumentModel.find({ caseId });
        res.status(200).json({ documents });
    } catch (error) {
        res.status(500).json({ message: "Error fetching documents", error });
    }
};

const getAllCases = async (req, res) => {
    try {
        const cases = await CaseModel.find();
        res.json({ success: true, data: cases });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching cases" });
    }
};

export const closeCase = async (req, res) => {
    try {
        const { caseId } = req.body;
        const updatedCase = await CaseModel.findByIdAndUpdate(
            caseId,
            { status: "Closed" },
            { new: true }
        );

        if (!updatedCase) {
            return res.status(404).json({
                success: "false",
                message: "Case not found"
            });
        }

        res.json({
            success: "true",
            case: updatedCase
        });
    } catch (error) {
        console.error("Error closing case:", error);
        res.status(500).json({
            success: "false",
            message: error.message || "Error closing case"
        });
    }
};

export { submitCase, fetchCase, fetchCaseUser, caseReject, getAllCases };