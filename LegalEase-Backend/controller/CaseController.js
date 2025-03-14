import CaseModel from '../model/CaseModel.js'
import { userModal } from '../model/UserModel.js';
import jwt from 'jsonwebtoken';

import dotenv from 'dotenv'
import DocumentModel from '../model/DocumentModel.js';
dotenv.config()

const submitCase = async (req, res) => {
    const { caseNum, caseName, caseDesc, advocate, client_id } = req.body.caseDetails

    try {
        const decodedToken = jwt.verify(client_id, process.env.JWT_SECRET);
        const clientToken = decodedToken.id
        if (!clientToken) {
            return res.status(404).json({ success: "false", message: "Client not found" });
        }
        const newCase = new CaseModel({ case_id: caseNum, client_id: clientToken, advocate_id: advocate, case_title: caseName, case_description: caseDesc });
        await newCase.save();
        res.json({ success: "true", message: "Case submitted successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: "false", message: "Internal server error" });
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

const caseConfirm = async (req, res) => {
    try {
        const caseNum = req.body.caseNum
        const caseDetail = await CaseModel.findOne({ _id: caseNum });

        if (caseDetail) {
            caseDetail.status = "In Progress"; // Update the status
            await caseDetail.save(); // Save changes to the database
        }

        res.json({success:"true"})
    } catch (error) {
        res.json({ success: 'false', message: "Case confirmed Unsuccess" })
    }
}

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
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    try {
        const cases = await CaseModel.find({ client_id: userId });
        res.status(200).json({ cases });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Error fetching cases", error });
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



export { submitCase, fetchCase, caseConfirm, fetchCaseUser, caseReject }