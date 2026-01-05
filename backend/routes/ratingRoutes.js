import express from 'express';
import {
    createOrUpdateRating,
    getRatingsByMess,
    getUserRatings,
    deleteRating,
    compareMesses
} from '../controllers/ratingController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { ratingValidation, handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

router.post('/', authenticateToken, ratingValidation, handleValidationErrors, createOrUpdateRating);
router.get('/mess/:messId', getRatingsByMess);
router.get('/user', authenticateToken, getUserRatings);
router.delete('/:ratingId', authenticateToken, deleteRating);
router.get('/compare', compareMesses);

export default router;