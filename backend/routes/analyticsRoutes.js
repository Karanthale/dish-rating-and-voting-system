import express from 'express';
import { getAnalytics, exportCSV } from '../controllers/analyticsController.js';
import { authenticateToken, authorizeRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authenticateToken, authorizeRole('admin'), getAnalytics);
router.get('/export', authenticateToken, authorizeRole('admin'), exportCSV);

export default router;