import express from 'express';
import { submitCase, fetchCase, caseConfirm, fetchCaseUser, caseReject, getAllCases, getCasesForUser, getDocumentsForUser } from '../controller/CaseController.js';

const caseRouter = express.Router();

caseRouter.post("/submit", submitCase)
caseRouter.post("/view", fetchCase)
caseRouter.post("/view-user", fetchCaseUser)
caseRouter.post("/confirm", caseConfirm)
caseRouter.post("/reject", caseReject)

caseRouter.get("/user/cases", getCasesForUser);
caseRouter.get("/user/documents/:caseId", getDocumentsForUser);

caseRouter.get('/', getAllCases); // Add this new route

export default caseRouter;