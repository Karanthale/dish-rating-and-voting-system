import express from 'express';
import {
    getAllMesses,
    getMessById,
    createMess,
    updateMess,
    deleteMess
} from '../controllers/messController.js';
import { authenticateToken, authorizeRole } from '../middleware/authMiddleware.js';
import { messValidation, handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

router.get('/', getAllMesses);
router.get('/:id', getMessById);
router.post('/', authenticateToken, authorizeRole('admin'), messValidation, handleValidationErrors, createMess);
router.put('/:id', authenticateToken, authorizeRole('admin'), messValidation, handleValidationErrors, updateMess);
router.delete('/:id', authenticateToken, authorizeRole('admin'), deleteMess);

export default router;