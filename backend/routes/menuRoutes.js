import express from 'express';
// 1. Updated import to match the new toggleStockStatus function name
import { getDailyMenu, toggleStockStatus, addMenuItem } from '../controllers/menuController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// PUBLIC ROUTES (Or accessible by any logged-in user)
// Fetch daily menu for a specific mess (Used by Student Rating Page)
router.get('/:messId', getDailyMenu);

// PROTECTED OWNER ROUTES
// 2. NEW: The Toggle Stock Route (Updated to PATCH and requires menuId in the URL)
router.patch('/stock/:menuId', authenticateToken, toggleStockStatus);

// Owner Route to add a new dish to today's menu
router.post('/add', authenticateToken, addMenuItem);

export default router;