import express from "express";
import { getCasesForAdvocate, uploadDocument, getDocumentsByCase, deleteDocument, renameDocument } from "../controller/DocumentController.js";

const documentRouter = express.Router();

documentRouter.get("/cases", getCasesForAdvocate);
documentRouter.post("/upload", uploadDocument);
documentRouter.get("/:caseId", getDocumentsByCase);
documentRouter.delete("/:id", deleteDocument);
documentRouter.put("/:id", renameDocument);

export default documentRouter;
