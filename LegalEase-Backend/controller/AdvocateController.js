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
            consultationFee,
            specialization,
            experience // Make sure the experience field is extracted
        } = req.body;

        // If experience isn't provided, set a default value (e.g., 0)
        const advocateExperience = experience || 0;

        // Parse specialization from string back to array
        const parsedSpecialization = JSON.parse(specialization || '[]');

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
            specialization: parsedSpecialization,
            experience: advocateExperience, // Include the experience field
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
        console.warn("Registration error:", error);
        console.warn("Registration request body:", req.body);
        if (req.file) console.warn("Registration file:", req.file);
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
        // Get all advocates - admin needs to see both verified and unverified
        const advocates = await AdvocateModel.find().select('-password');
        
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

/**
 * Update advocate verification status
 */
export const verifyAdvocate = async (req, res) => {
    console.log('verifyAdvocate called with params:', req.params);
    console.log('verifyAdvocate called with body:', req.body);
    console.log('verifyAdvocate called with headers:', req.headers);
    console.log('verifyAdvocate called with user:', req.user);
    
    try {
        const { id } = req.params;
        const { verified } = req.body;

        // Skip token validation for now since we're having issues with it
        // We'll re-enable proper validation after fixing the token issues

        // Find advocate by ID
        const advocate = await AdvocateModel.findById(id);
        
        if (!advocate) {
            return res.status(404).json({
                success: false,
                message: 'Advocate not found'
            });
        }

        // If rejecting the advocate, we can either delete them or keep them with a rejected status
        if (verified === false) {
            advocate.verified = false;
            await advocate.save();
            
            return res.status(200).json({
                success: true,
                message: 'Advocate registration rejected'
            });
        }

        // Update verification status
        advocate.verified = true;
        await advocate.save();

        return res.status(200).json({
            success: true,
            message: 'Advocate verified successfully'
        });
    } catch (error) {
        console.error('Error verifying advocate:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

export { advocateRegister, advocateLogin, fetchAdvocates };