import express from 'express'
import {userLogin, userRegister, fetchUser, userUpdate} from '../controller/UserController.js'

const userRouter = express.Router()

userRouter.post('/login',userLogin)
userRouter.post('/register',userRegister)
userRouter.post('/fetch',fetchUser)
userRouter.post('/update',userUpdate)

export default userRouter;