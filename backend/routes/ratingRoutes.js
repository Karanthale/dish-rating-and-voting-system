import express from 'express';
import {
    createOrUpdateRating,
    getRatingsByMess,
    getUserRatings,
    deleteRating,
    compareMesses,
    getTodaysMenu,     // <-- Add this new function
    submitDishRating   // <-- Add this new function
} from '../controllers/ratingController.js';
import { authenticateToken } from '../middleware/authMiddleware.js'; // Make sure this is here!
import { ratingValidation, handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

router.post('/', authenticateToken, ratingValidation, handleValidationErrors, createOrUpdateRating);
router.get('/mess/:messId', getRatingsByMess);
router.get('/user', authenticateToken, getUserRatings);
router.delete('/:ratingId', authenticateToken, deleteRating);
router.get('/menu/:messId', authenticateToken, getTodaysMenu); // Route to get today's menu for a specific mess
router.post('/dish', authenticateToken, submitDishRating); // Route for a student to submit a rating for a specific dish
router.get('/compare', compareMesses);

export default router;