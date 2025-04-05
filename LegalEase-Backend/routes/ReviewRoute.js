import express from 'express';
import { submitReview, getAdvocateReviews } from '../controller/ReviewController.js';

const reviewRouter = express.Router();

reviewRouter.post('/submit', submitReview);
reviewRouter.get('/advocate/:advocateId', getAdvocateReviews);

export default reviewRouter;
