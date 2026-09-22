import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getStats, listMine, clearMine } from '../controllers/messagesController.js';

const router = express.Router();

router.get('/stats', requireAuth, getStats);
router.get('/', requireAuth, listMine);
router.delete('/', requireAuth, clearMine);

export default router;
