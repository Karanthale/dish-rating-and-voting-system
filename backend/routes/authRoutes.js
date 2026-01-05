import express from 'express';
import { signup, login, getProfile, updateProfile } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { signupValidation, loginValidation, handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

router.post('/signup', signupValidation, handleValidationErrors, signup);
router.post('/login', loginValidation, handleValidationErrors, login);
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);

export default router;