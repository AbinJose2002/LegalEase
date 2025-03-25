import AdvocateModel from "../model/AdvocateModel.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import dotenv from 'dotenv'
dotenv.config()

const advocateRegister = async (req, res) => {
    try {
        console.log('Registration request body:', req.body);
        console.log('Registration file:', req.file);

        const { 
            firstName, 
            lastName, 
            email, 
            password, 
            phone, 
            bio, 
            advanceFee, 
            sittingFee,
            consultationFee 
        } = req.body;

        // Parse specialization from string back to array
        const specialization = JSON.parse(req.body.specialization || '[]');

        // Validate required fields
        if (!firstName || !lastName || !email || !phone || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
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

        // Create new advocate
        const newAdvocate = new AdvocateModel({
            firstName,
            lastName,
            email,
            phone,
            password: hashedPassword,
            bio,
            specialization,
            image: req.file ? req.file.filename : null,
            advanceFee: Number(advanceFee),
            sittingFee: Number(sittingFee),
            consultationFee: Number(consultationFee),
            verified: false
        });

        const savedAdvocate = await newAdvocate.save();
        const token = createToken(savedAdvocate._id);

        res.status(201).json({
            success: true,
            message: 'Registration successful! Please wait for admin approval.',
            token
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Registration failed'
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

export const getProfile = async (req, res) => {
    try {
        const { token } = req.body;
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        
        const advocate = await AdvocateModel.findById(decodedToken.id)
            .select('-password'); // Exclude password from response
        
        if (!advocate) {
            return res.status(404).json({
                success: "false",
                message: "Advocate not found"
            });
        }

        res.json({
            success: "true",
            advocate
        });
    } catch (error) {
        res.status(500).json({
            success: "false",
            message: "Error fetching profile",
            error: error.message
        });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { token, ...updateData } = req.body;
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        
        const advocate = await AdvocateModel.findByIdAndUpdate(
            decodedToken.id,
            updateData,
            { new: true, select: '-password' }
        );

        if (!advocate) {
            return res.status(404).json({
                success: "false",
                message: "Advocate not found"
            });
        }

        res.json({
            success: "true",
            advocate
        });
    } catch (error) {
        res.status(500).json({
            success: "false",
            message: "Error updating profile",
            error: error.message
        });
    }
};

export { advocateRegister, advocateLogin, fetchAdvocates };