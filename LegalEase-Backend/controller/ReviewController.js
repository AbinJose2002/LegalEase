import jwt from 'jsonwebtoken';
import ReviewModel from '../model/ReviewModel.js';
import CaseModel from '../model/CaseModel.js';
import { userModal } from '../model/UserModel.js';  // Add this import

export const submitReview = async (req, res) => {
    try {
        const { caseId, rating, review, token } = req.body;
        console.log('Received review data:', { caseId, rating, review }); // Updated logging
        
        if (!token) {
            return res.status(401).json({
                success: "false",
                message: "No token provided"
            });
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        // Get case details to get advocate ID
        const caseDetails = await CaseModel.findById(caseId);
        if (!caseDetails) {
            return res.status(404).json({
                success: "false",
                message: "Case not found"
            });
        }

        // Check if review already exists
        const existingReview = await ReviewModel.findOne({
            caseId,
            clientId: decodedToken.id
        });

        if (existingReview) {
            return res.status(400).json({
                success: "false",
                message: "You have already reviewed this case"
            });
        }

        const newReview = new ReviewModel({
            caseId,
            clientId: decodedToken.id,
            advocateId: caseDetails.advocate_id,
            rating,
            review
        });

        await newReview.save();

        res.json({
            success: "true",
            message: "Review submitted successfully",
            review: newReview
        });
    } catch (error) {
        console.error('Error in submitReview:', error); // Updated error logging
        res.status(500).json({
            success: "false",
            message: error.message || "Error submitting review"
        });
    }
};

export const getAdvocateReviews = async (req, res) => {
    try {
        const { advocateId } = req.params;
        console.log('Fetching reviews for advocate:', advocateId);

        // Check if advocateId is valid
        if (!advocateId) {
            return res.status(400).json({
                success: "false",
                message: "Advocate ID is required"
            });
        }

        const reviews = await ReviewModel.find({ advocateId })
            .populate({
                path: 'clientId',
                model: userModal,  // Use the imported userModal
                select: 'firstName lastName'
            })
            .populate({
                path: 'caseId',
                model: 'Case',
                select: 'case_title case_id status'
            })
            .sort({ createdAt: -1 })
            .exec();

        console.log(`Found ${reviews.length} reviews`);

        res.json({
            success: "true",
            reviews: reviews.map(review => ({
                ...review.toObject(),
                clientId: review.clientId || { firstName: 'Unknown', lastName: 'User' },
                caseId: review.caseId || { case_title: 'Unknown Case' }
            }))
        });
    } catch (error) {
        console.error('Error in getAdvocateReviews:', error);
        res.status(500).json({
            success: "false",
            message: "Error fetching reviews",
            error: error.message || "Unknown error occurred"
        });
    }
};
