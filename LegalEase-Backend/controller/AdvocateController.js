import AdvocateModel from "../model/AdvocateModel.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import dotenv from 'dotenv'
dotenv.config()

const advocateRegister = async (req, res) => {
    try {
        const { firstName, lastName, specialization, email, password, phone, bio, advanceFee, sittingFee } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !email || !phone || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields: firstName, lastName, email, phone, password'
            });
        }

        // Check if advocate already exists
        const existingAdvocate = await AdvocateModel.findOne({ email });
        if (existingAdvocate) {
            return res.status(400).json({
                success: false,
                message: 'Advocate already exists with this email'
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);


        // Handle image upload (store only filename)
        const imagePath = req.file ? req.file.filename : null;

        // Create new advocate
        const newAdvocate = new AdvocateModel({
            firstName,
            lastName,
            email,
            phone,
            password: hashedPassword,
            bio,
            specialization,
            image: imagePath, // Only storing filename
            advanceFee,
            sittingFee,
            verified: false
        });

        // Save advocate to database
        const savedAdvocate = await newAdvocate.save();

        // Create JWT token
        const token = createToken(savedAdvocate._id);

        // Remove password before sending response
        const { password: _, ...advocateData } = savedAdvocate.toObject();

        res.status(201).json({
            success: true,
            message: 'Advocate registered successfully',
            token,
            advocate: advocateData
        });

    } catch (error) {
        console.error('Registration error:', error);

        let errorMessage = 'Registration failed';
        if (error.name === 'ValidationError') {
            errorMessage = Object.values(error.errors).map(val => val.message).join(', ');
        } else if (error.code === 11000) {
            errorMessage = 'Email already exists';
        }

        res.status(500).json({
            success: false,
            message: errorMessage || 'Internal server error'
        });
    }
};

// ✅ Reusable function for token creation
const createToken = (id) => {
    return jwt.sign({ id, role: 'advocate' }, process.env.JWT_SECRET, { expiresIn: '7d' });
};


const advocateLogin = async (req, res) => {
    const { username, password } = req.body
    try {
        const user = await AdvocateModel.findOne({ email: username })
        if (user.verified === false) {
            return res.status(400).json({
                success: false,
                message: 'Your account is not verified yet. Kindly wait for the verification'
            });
        }
        if (!user) {
            req.json({ success: false, message: 'User not found' })
        }
        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) {
            res.json({ success: false, message: 'Email and password not matching' })
        }
        const token = createToken(user._id)
        // console.log(token)

        res.json({ success: true, data: token })
    } catch (error) {
        // console.log('hi');
        // console.log(error)
        res.json({ success: false, message: "Internal server error!" })
    }
}

const fetchAdvocates = async (req, res) => {
    try {
        const advocates = await AdvocateModel.find({ verified: true }).select('-password');
        res.status(200).json({
            success: true,
            advocates
        });
    } catch (error) {
        console.error('Fetch advocates error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

export { advocateRegister, advocateLogin, fetchAdvocates };