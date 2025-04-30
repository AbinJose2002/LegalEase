import express from 'express';
import { userLogin, userRegister, fetchUser, userUpdate, getAllUsers } from '../controller/UserController.js';

const userRouter = express.Router();

userRouter.post('/login', userLogin);
userRouter.post('/register', userRegister);
userRouter.post('/fetch', fetchUser);
userRouter.post('/update', userUpdate);

userRouter.post('/register-check', async (req, res) => {
  const { email } = req.body;
  try {
    const existingUser = await userModal.findOne({ email });
    res.json({ exists: !!existingUser });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

userRouter.get('/', getAllUsers);

// Add a new route to get user by ID
userRouter.get('/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required"
            });
        }
        
        // Find the user by ID
        const user = await userModal.findById(userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        
        // Return user data without sensitive information
        const userData = {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone
        };
        
        return res.status(200).json({
            success: true,
            data: userData
        });
    } catch (error) {
        console.error("Error fetching user:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

export default userRouter;