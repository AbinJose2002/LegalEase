import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { advocateRegister, advocateLogin, fetchAdvocates, getProfile, updateProfile } from '../controller/AdvocateController.js';

// Ensure 'uploads' directory exists
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });

const advocateRouter = express.Router();

advocateRouter.post('/login', advocateLogin);
advocateRouter.post('/register', upload.single('image'), advocateRegister);
advocateRouter.get('/', fetchAdvocates); // Add this new route
advocateRouter.get('/fetch', fetchAdvocates);
advocateRouter.post('/get-profile', getProfile);
advocateRouter.post('/update-profile', updateProfile);

export default advocateRouter;
