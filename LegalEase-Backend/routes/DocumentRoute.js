import express from "express";
import { 
    getCasesForAdvocate, 
    uploadDocument, 
    getDocumentsByCase, 
    deleteDocument, 
    renameDocument,
    getUserDocuments 
} from "../controller/DocumentController.js";
import { upload } from '../middleware/multer.js';
import { extractUser } from '../middleware/auth.js';

const documentRouter = express.Router();

documentRouter.get("/cases", getCasesForAdvocate);
documentRouter.post("/upload", uploadDocument);
documentRouter.get("/:caseId", getDocumentsByCase);
documentRouter.delete("/:id", deleteDocument);
documentRouter.put("/:id", renameDocument);

// Get all documents for the logged-in user
documentRouter.get('/user', extractUser, getUserDocuments);
documentRouter.get('/user/:userId', getUserDocuments);

export default documentRouter;
