import CaseModel from '../model/CaseModel.js'
import { userModal } from '../model/UserModel.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv'
import DocumentModel from '../model/DocumentModel.js';
import AdvocateModel from '../model/AdvocateModel.js'; // Add this import for AdvocateModel
import PaymentModel from '../model/PaymentModel.js'; // Also import PaymentModel since it's used in caseConfirm

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
        
        if (!advToken) {
            return res.status(400).json({ 
                success: "false", 
                message: "Advocate token is required" 
            });
        }
        
        // Verify the token and extract the advocate ID
        const decodedToken = jwt.verify(advToken, process.env.JWT_SECRET);
        const advocateId = decodedToken.id;
        
        console.log(`Fetching cases specifically for advocate ID: ${advocateId}`);

        // IMPORTANT: Only fetch cases where advocate_id matches exactly the current advocate
        let clients = await CaseModel.find({ advocate_id: advocateId });
        console.log(`Found ${clients.length} cases for advocate ${advocateId}`);
          
        // Fetch user details for each client
        for (let i = 0; i < clients.length; i++) {
            const user = await userModal.findById(clients[i].client_id);
            clients[i] = clients[i].toObject(); // Convert Mongoose document to plain object
            clients[i].userDetails = user ? user.toObject() : null; // Append user data
        }
        
        res.json({ success: "true", clients });
    } catch (error) {
        console.error("Error in fetchCase:", error);
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

        // Get the case details first to access advocate and client info
        const caseDetails = await CaseModel.findById(caseNum);
        if (!caseDetails) {
            return res.status(404).json({
                success: "false",
                message: "Case not found"
            });
        }

        // Get advocate details to determine advance fee
        const advocate = await AdvocateModel.findById(caseDetails.advocate_id);
        if (!advocate) {
            return res.status(404).json({
                success: "false",
                message: "Advocate information not found"
            });
        }

        // Update case status
        const updatedCase = await CaseModel.findByIdAndUpdate(
            caseNum,
            { 
                case_id: case_id,
                status: "Open",
                caseType: caseType 
            },
            { new: true }
        );

        // Create a pending payment record for the advance fee
        const newPayment = new PaymentModel({
            case_id: updatedCase._id,
            client_id: updatedCase.client_id,
            advocate_id: updatedCase.advocate_id,
            amount: advocate.advanceFee || 5000, // Default if not set
            type: 'advance',
            status: 'pending',
            description: `Advance payment for case ${case_id}`
        });

        await newPayment.save();
        console.log("Created pending advance payment:", newPayment);

        res.json({ 
            success: "true", 
            case: updatedCase,
            payment: {
                id: newPayment._id,
                amount: newPayment.amount,
                status: newPayment.status
            }
        });
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
        // Don't try to verify a token directly - check if it exists first
        const token = req.body.token;
        let userId;
        
        // Use the userId from query or params if available (preferred method)
        if (req.query.userId || req.params.userId) {
            userId = req.query.userId || req.params.userId;
            console.log("Using userId from query/params:", userId);
        }
        // Try x-user-id header next
        else if (req.headers['x-user-id']) {
            userId = req.headers['x-user-id'];
            console.log("Using userId from x-user-id header:", userId);
        }
        // Only try to decode token if it exists
        else if (token) {
            try {
                const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
                userId = decodedToken.id;
                console.log("Using userId from token:", userId);
            } catch (tokenError) {
                console.error("Token verification failed:", tokenError.message);
                // Don't return error - continue to try other ID sources
            }
        }
        // Try to extract from Authorization header if present
        else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            try {
                const headerToken = req.headers.authorization.split(' ')[1];
                const decodedToken = jwt.verify(headerToken, process.env.JWT_SECRET);
                userId = decodedToken.id;
                console.log("Using userId from Authorization header:", userId);
            } catch (tokenError) {
                console.error("Authorization header token verification failed:", tokenError.message);
                // Continue to next check
            }
        }
        
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required. Please provide it as a query parameter, URL parameter, or through authentication."
            });
        }
        
        console.log("Finding cases for userId:", userId);
        
        const cases = await CaseModel.find({ 
            client_id: userId
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: cases.length,
            data: cases
        });
    } catch (error) {
        console.error('Error in getCasesForUser:', error);
        return res.status(500).json({
            success: false,
            message: "Server error while fetching cases",
            error: error.message
        });
    }
};

// Get Documents for Selected Case
export const getDocumentsForCase = async (req, res) => {
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

/**
 * Get all cases for a specific user
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Object} JSON response with user's cases or error message
 */
export const getUserCases = async (req, res) => {
    try {
        // Log to help debug what we're receiving
        console.log("getUserCases called with headers:", req.headers);
        console.log("getUserCases called with params:", req.params);
        console.log("getUserCases called with query:", req.query);
        
        // Determine the user ID - this could be from a token or direct ID
        let userId;
        let rawToken = null;
        
        // First check query/params for direct userId
        if (req.query.userId) {
            // Check if this looks like a JWT token (contains periods)
            if (req.query.userId.includes('.')) {
                rawToken = req.query.userId;
                try {
                    // Decode token to get the actual user ID
                    const decoded = jwt.verify(req.query.userId, process.env.JWT_SECRET);
                    userId = decoded.id;
                    console.log("Extracted user ID from query token:", userId);
                } catch (tokenError) {
                    console.log("Invalid token in query, will use as direct ID:", tokenError.message);
                    userId = req.query.userId;
                }
            } else {
                // Direct ID, not a token
                userId = req.query.userId;
                console.log("Using direct user ID from query:", userId);
            }
        } 
        // Check URL params if query doesn't have it
        else if (req.params.userId) {
            // Same token check as above
            if (req.params.userId.includes('.')) {
                rawToken = req.params.userId;
                try {
                    const decoded = jwt.verify(req.params.userId, process.env.JWT_SECRET);
                    userId = decoded.id;
                    console.log("Extracted user ID from params token:", userId);
                } catch (tokenError) {
                    console.log("Invalid token in params, will use as direct ID:", tokenError.message);
                    userId = req.params.userId;
                }
            } else {
                userId = req.params.userId;
                console.log("Using direct user ID from params:", userId);
            }
        }
        
        // Check Authorization header if no direct ID found
        if (!userId) {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                const token = authHeader.substring(7);
                rawToken = token;
                try {
                    const decoded = jwt.verify(token, process.env.JWT_SECRET);
                    userId = decoded.id;
                    console.log("Extracted user ID from auth header token:", userId);
                } catch (err) {
                    console.log("Token verification failed from headers:", err.message);
                }
            }
        }
        
        // Check request body if all else fails
        if (!userId && req.body && req.body.token) {
            rawToken = req.body.token;
            try {
                const decoded = jwt.verify(req.body.token, process.env.JWT_SECRET);
                userId = decoded.id;
                console.log("Extracted user ID from body token:", userId);
            } catch (err) {
                console.log("Token verification failed from body:", err.message);
            }
        }
        
        // Custom x-user-id header check
        if (!userId && req.headers['x-user-id']) {
            userId = req.headers['x-user-id'];
            console.log("Using x-user-id header:", userId);
        }
        
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required"
            });
        }
        
        console.log("Final user ID being used for query:", userId);
        console.log("Was extracted from token:", !!rawToken);
        
        // Fetch cases where client_id matches the userId
        const cases = await CaseModel.find({ client_id: userId }).sort({ createdAt: -1 });
        
        console.log(`Found ${cases.length} cases for user ${userId}`);
        
        return res.status(200).json({
            success: true,
            count: cases.length,
            data: cases
        });
    } catch (error) {
        console.error("Error in getUserCases:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while fetching user cases",
            error: error.message
        });
    }
};

export const viewCase = async (req, res) => {
    try {
        const { caseId } = req.body;
        
        // Validate the case ID
        if (!caseId) {
            return res.status(400).json({
                success: false,
                message: "Case ID is required"
            });
        }

        console.log(`Fetching case details for ID: ${caseId}`);
        
        // Find the case first
        const caseDetails = await CaseModel.findById(caseId);
        
        if (!caseDetails) {
            return res.status(404).json({
                success: false,
                message: "Case not found"
            });
        }
        
        // Fetch related data - advocate and client details
        const advocate = await AdvocateModel.findById(caseDetails.advocate_id).select('-password');
        const client = await userModal.findById(caseDetails.client_id).select('-password');
        
        // Also fetch any documents related to this case
        const documents = await DocumentModel.find({ caseId: caseDetails._id });
        
        // Create a comprehensive response with all related data
        const response = {
            case: caseDetails,
            advocate: advocate || { name: "Unknown" }, // Provide defaults if data is missing
            client: client || { name: "Unknown" },
            documents: documents || []
        };
        
        return res.status(200).json({
            success: true,
            data: response
        });
    } catch (error) {
        console.error('Error in viewCase:', error);
        
        return res.status(500).json({
            success: false,
            message: "Server error while fetching case details",
            error: error.message
        });
    }
};

/**
 * Get all documents related to a specific case for a user
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Object} - JSON response with documents or error message
 */
export const getDocumentsForUser = async (req, res) => {
    try {
        const { caseId } = req.params;
        
        if (!caseId) {
            return res.status(400).json({
                success: false,
                message: "Case ID is required"
            });
        }
        
        // Check if the case exists and belongs to the current user
        const caseData = await CaseModel.findById(caseId);
        
        if (!caseData) {
            return res.status(404).json({
                success: false,
                message: "Case not found"
            });
        }
        
        // Fetch documents for this case from DocumentModel
        const documents = await DocumentModel.find({ caseId });
        
        return res.status(200).json({
            success: true,
            documents
        });
    } catch (error) {
        console.error("Error fetching documents for case:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while fetching documents",
            error: error.message
        });
    }
};

// Get case by ID (modified from viewCase)
export const getCaseById = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Validate the case ID
        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Case ID is required"
            });
        }

        console.log(`Fetching case details for ID: ${id}`);
        
        // Find the case first
        const caseDetails = await CaseModel.findById(id);
        
        if (!caseDetails) {
            return res.status(404).json({
                success: false,
                message: "Case not found"
            });
        }
        
        // Get advocate and client details
        let advocate = null;
        let client = null;
        
        try {
            advocate = await AdvocateModel.findById(caseDetails.advocate_id).select('-password');
        } catch (err) {
            console.log("Error fetching advocate details:", err);
        }
        
        try {
            client = await userModal.findById(caseDetails.client_id).select('-password');
        } catch (err) {
            console.log("Error fetching client details:", err);
        }
        
        // Also fetch any documents related to this case
        let documents = [];
        try {
            documents = await DocumentModel.find({ caseId: caseDetails._id });
        } catch (err) {
            console.log("Error fetching case documents:", err);
        }
        
        // Create a comprehensive response with all related data
        const response = {
            case: caseDetails,
            advocate: advocate || { name: "Unknown" }, // Provide defaults if data is missing
            client: client || { name: "Unknown" },
            documents: documents || []
        };
        
        return res.status(200).json({
            success: true,
            data: response
        });
    } catch (error) {
        console.error('Error in getCaseById:', error);
        
        return res.status(500).json({
            success: false,
            message: "Server error while fetching case details",
            error: error.message
        });
    }
};

/**
 * Get all cases for a specific user - aliased function for getUserCases
 * @param {Object} req - Request object with userId in body or query
 * @param {Object} res - Response object
 * @returns {Object} JSON with user's cases
 */
export const getUserCasesAlias = async (req, res) => {
    // This is just an alias for getUserCases to maintain compatibility
    return getUserCases(req, res);
};

export { submitCase, fetchCase, fetchCaseUser, caseReject, getAllCases };