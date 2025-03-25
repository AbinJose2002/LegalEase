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

export default userRouter;