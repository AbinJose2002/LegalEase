import { userModal } from "../model/UserModel.js";
import validator from 'validator'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

const userLogin = async (req, res) => {
    const { username, password } = req.body
    try {
        const user = await userModal.findOne({ email: username })
        if (!user) {
            req.json({ success: false, message: 'User not found' })
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            res.json({ success: false, message: 'Email and password not matching' })
        }
        const token = createToken(user._id)
        console.log(token)
        
        res.json({ success: true, data: token })
    } catch (error) {
        console.log('hi');
        console.log(error)
        res.json({ success: false, message: "Internal server error!" })
    }
}

const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET)
}

const userRegister = async (req, res) => {
    const { firstName, secondName, email, password, phone } = req.body
    try {
        if (!validator.isEmail(email)) {
            res.json({ success: false, message: "User email already exists!" })
        }
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, 10)
        console.log(hashedPassword)
        const newUser = new userModal({
            firstName,
            lastName: secondName,
            email,
            phone,
            password: hashedPassword
        });
        const user = await newUser.save();
        const token = createToken(user._id);
        res.json({ success: true, token })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Internal server error" })
    }
}

const fetchUser = async (req, res) => {
    const token = req.body.token;
    console.log(token)
    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
        const userId = decodedToken.id;
        const user = await userModal.findOne({ _id: userId })
        res.json({ success: true, data: user })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: 'Internal server error!!' })
    }
}

const userUpdate = async (req, res) => {
    // console.log(req.body)
    try {
        const user = await userModal.findById(req.body.userId);
        user.firstName = req.body.firstName || user.firstName;
        user.lastName = req.body.lastName || user.lastName;
        user.email = req.body.email || user.email;
        user.phone = req.body.phone || user.phone;

    //     // Handle password change
        if (req.body.newPassword) {
            const isMatch = await bcrypt.compare(req.body.currentPassword, user.password);
            if (!isMatch) {
                console.log(isMatch)
                return res.status(400).json({ message: 'Current password is incorrect' });
            }
            user.password = await bcrypt.hash(req.body.newPassword, 10);
        }
        await user.save();

        const { password, ...userData } = user.toObject();
        res.json({ success: true, data: userData });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export { userLogin, userRegister, fetchUser, userUpdate };