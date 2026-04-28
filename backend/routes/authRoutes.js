import express from 'express';
// 1. IMPORT THE NEW ADMIN CONTROLLERS
import { signup, login, getProfile, updateProfile, getPendingOwners, updateOwnerStatus,getActiveOwners } from '../controllers/authController.js';
// 2. IMPORT THE ADMIN MIDDLEWARE
import { authenticateToken, authorizeAdmin } from '../middleware/authMiddleware.js';
import { signupValidation, loginValidation, handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

// Public / Standard Routes
router.post('/signup', signupValidation, handleValidationErrors, signup);
router.post('/login', loginValidation, handleValidationErrors, login);
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);

// ==========================================
// ADMIN ROUTES (Protected by Double Middleware)
// ==========================================
// Fetch list of owners waiting for approval
router.get('/admin/pending-owners', authenticateToken, authorizeAdmin, getPendingOwners);

// Approve or reject an owner account
router.patch('/admin/update-status', authenticateToken, authorizeAdmin, updateOwnerStatus);

router.get('/admin/active-owners', getActiveOwners);



export default router;