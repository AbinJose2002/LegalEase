import express from 'express';
import { submitCase, fetchCase, caseConfirm, fetchCaseUser, caseReject, getAllCases, getCasesForUser, getDocumentsForUser, closeCase } from '../controller/CaseController.js';

const caseRouter = express.Router();

caseRouter.post("/submit", submitCase)
caseRouter.post("/view", fetchCase)
caseRouter.post("/view-user", fetchCaseUser)
caseRouter.post("/confirm", caseConfirm)
caseRouter.post("/reject", caseReject)
caseRouter.post("/close", closeCase)

caseRouter.get("/user/cases", getCasesForUser);
caseRouter.get("/user/documents/:caseId", getDocumentsForUser);

caseRouter.post('/user-cases', getCasesForUser);

caseRouter.get('/', getAllCases); // Add this new route

// Add this test route
caseRouter.post("/test-submit", (req, res) => {
    console.log("Received test case submission:", req.body);
    res.json({ 
        success: "true", 
        message: "Test submission received successfully", 
        receivedData: req.body 
    });
});

export default caseRouter;