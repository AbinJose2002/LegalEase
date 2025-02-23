import express from 'express';
import {caseConfirm, caseReject, fetchCase, fetchCaseUser, submitCase} from '../controller/CaseController.js'

const caseRouter = express.Router();

caseRouter.post("/submit",submitCase)
caseRouter.post("/view", fetchCase)
caseRouter.post("/view-user", fetchCaseUser)
caseRouter.post("/confirm", caseConfirm)
caseRouter.post("/reject", caseReject)

export default caseRouter;