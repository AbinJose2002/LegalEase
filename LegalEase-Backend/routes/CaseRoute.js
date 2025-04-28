import express from 'express';
import { 
    submitCase, 
    fetchCase, 
    fetchCaseUser, 
    caseReject, 
    caseConfirm, 
    getCasesForUser, 
    getDocumentsForUser,
    closeCase,
    getUserCases,
    getAllCases
} from '../controller/CaseController.js';
import { verifyToken } from '../middleware/auth.js';

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
router.post("/view", fetchCase)
router.post("/view-user", fetchCaseUser)
router.post("/confirm", caseConfirm)
router.post("/reject", caseReject)
router.post("/close", closeCase)

router.get("/user/cases", getCasesForUser);
router.get("/user/documents/:caseId", getDocumentsForUser);

router.post('/user-cases', getCasesForUser);

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

// Update the user cases route - make auth optional
router.get('/user/cases', optionalAuth, getUserCases);

// Add an alternative route with explicit user ID parameter
router.get('/user/:userId/cases', getUserCases);

export default router;