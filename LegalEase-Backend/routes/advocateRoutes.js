import express from 'express';
import { 
    advocateRegister, 
    advocateLogin, 
    fetchAdvocates,
    getProfile,
    updateProfile,
    verifyAdvocate // Add the new controller function
} from '../controller/AdvocateController.js';
import { upload } from '../middleware/multer.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Routes
router.post('/register', upload.single('image'), advocateRegister);
router.post('/login', advocateLogin);
router.get('/', fetchAdvocates);
router.post('/profile', getProfile);
router.put('/profile', updateProfile);

// Add a new route for advocate verification
router.put('/verify/:id', verifyToken, verifyAdvocate);

export default router;
