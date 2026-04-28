import express from 'express';
import * as pollController from '../controllers/pollController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Student Routes
// FIX: Changed getActivePolls to getActivePoll (removed the 's')
router.get('/mess/:messId', authenticateToken, pollController.getActivePoll);
router.post('/vote', authenticateToken, pollController.submitVote);

// Owner Routes
// We added "pollController." right before createPoll to fix the ReferenceError!
router.post('/create', authenticateToken, pollController.createPoll);

export default router;