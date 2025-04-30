import express from 'express';
import jwt from 'jsonwebtoken';
import { 
    submitCase, 
    fetchCase, 
    fetchCaseUser, 
    caseConfirm, 
    caseReject, 
    getAllCases,
    getUserCases,
    closeCase,
    getCaseById,
    viewCase,
    getDocumentsForCase,
    getUserCasesAlias
} from '../controller/CaseController.js';
import CaseModel from '../model/CaseModel.js'; // Add import for CaseModel
import { userModal } from '../model/UserModel.js'; // Add import for userModal

const router = express.Router();

// Create a special middleware for the user cases endpoint
const optionalAuth = (req, res, next) => {
    try {
        // If auth header exists, try to verify it
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                req.user = decoded;
            } catch (err) {
                console.log("Token verification failed but continuing:", err.message);
                // Continue anyway, don't block the request
            }
        }
        next();
    } catch (error) {
        next(); // Always continue to the route handler
    }
};

// Existing routes
router.post("/submit", submitCase)
router.post("/view", viewCase) // Ensure the view route is properly defined
router.post("/view-user", fetchCaseUser)
router.post("/confirm", caseConfirm)
router.post("/reject", caseReject)
router.post("/close", closeCase)

router.get("/user/cases", getUserCases); // Use getUserCases instead of getCasesForUser

// Update the route to use the renamed function
router.get("/user/documents/:caseId", getDocumentsForCase);

router.post('/user-cases', getUserCasesAlias);

router.get('/', getAllCases); // Add this new route

// Add this test route
router.post("/test-submit", (req, res) => {
    console.log("Received test case submission:", req.body);
    res.json({ 
        success: "true", 
        message: "Test submission received successfully", 
        receivedData: req.body 
    });
});

// Different ways to access user cases - for maximum flexibility
router.get('/user/cases', getUserCases); // No token required, use query parameters
router.get('/user/:userId/cases', getUserCases); // Use URL parameter

// Add this route for getting a case by ID
router.get('/:id', getCaseById);

// If you still want to maintain the old POST endpoint for backward compatibility
router.post('/view', (req, res) => {
    if (!req.body.caseId) {
        return res.status(400).json({
            success: false,
            message: "Case ID is required in the request body"
        });
    }
    
    // Forward the request to the GET endpoint
    req.params.id = req.body.caseId;
    getCaseById(req, res);
});

// Add this GET route that will work with the updated frontend
router.get('/', async (req, res) => {
  try {
    const advocateId = req.headers['x-advocate-id'] || req.query.advocateId;
    
    // Get auth token info if present
    let tokenUserId = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        tokenUserId = decoded.id;
        console.log(`Token verified for user ID: ${tokenUserId}`);
      } catch (error) {
        console.error("Token verification error:", error);
      }
    }
    
    // Use the advocate ID from headers/query or fall back to token ID
    const effectiveId = advocateId || tokenUserId;
    
    if (!effectiveId) {
      return res.status(400).json({
        success: false,
        message: "Advocate ID is required"
      });
    }
    
    console.log(`Finding cases for advocate ID: ${effectiveId}`);
    
    // Find cases where advocate_id matches
    const cases = await CaseModel.find({ advocate_id: effectiveId });
    
    // Fetch user details for each case
    for (let i = 0; i < cases.length; i++) {
      const user = await userModal.findById(cases[i].client_id);
      cases[i] = cases[i].toObject();
      cases[i].userDetails = user ? user.toObject() : null;
    }
    
    console.log(`Found ${cases.length} cases for advocate ${effectiveId}`);
    
    return res.status(200).json({
      success: true,
      data: cases
    });
  } catch (error) {
    console.error("Error fetching advocate cases:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching cases",
      error: error.message
    });
  }
});

// Alias for backward compatibility
router.post('/fetch', async (req, res) => {
  try {
    const { advToken } = req.body;
    
    if (!advToken) {
      return res.status(400).json({
        success: false,
        message: "Advocate token is required"
      });
    }
    
    // Decode the token to get advocate ID
    const decoded = jwt.verify(advToken, process.env.JWT_SECRET);
    const advocateId = decoded.id;
    
    console.log(`Fetching cases for advocate ID (from token): ${advocateId}`);
    
    // Find cases where advocate_id matches
    const cases = await CaseModel.find({ advocate_id: advocateId });
    
    // Fetch user details for each case
    for (let i = 0; i < cases.length; i++) {
      const user = await userModal.findById(cases[i].client_id);
      cases[i] = cases[i].toObject();
      cases[i].userDetails = user ? user.toObject() : null;
    }
    
    console.log(`Found ${cases.length} cases for advocate ${advocateId}`);
    
    return res.json({
      success: "true",
      clients: cases 
    });
  } catch (error) {
    console.error("Error in fetch endpoint:", error);
    return res.status(500).json({
      success: "false",
      message: "Server error while fetching cases",
      error: error.message
    });
  }
});

export default router;