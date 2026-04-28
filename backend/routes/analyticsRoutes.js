import express from 'express';
import { getAnalytics, exportCSV, getOwnerAnalytics } from '../controllers/analyticsController.js';
import { authenticateToken, authorizeRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authenticateToken, authorizeRole('admin'), getAnalytics);
router.get('/export', authenticateToken, authorizeRole('admin'), exportCSV);
router.get('/owner/:messId', authenticateToken, getOwnerAnalytics);

export default router;