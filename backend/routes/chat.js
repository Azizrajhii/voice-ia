import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { postChat } from '../controllers/chatController.js';
import { chatLimiter } from '../middleware/rateLimit.js';

const router = express.Router();

router.post('/', requireAuth, chatLimiter, postChat);

export default router;
