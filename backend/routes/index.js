import express from 'express';
import { getHealth, getApiInfo } from '../controllers/healthController.js';
import authRouter from './auth.js';
import usersRouter from './users.js';
import messagesRouter from './messages.js';
import chatRouter from './chat.js';
import adminRouter from './admin.js';

const router = express.Router();

router.get('/health', getHealth);
router.get('/', getApiInfo);
router.use('/auth', authRouter);
router.use('/users', usersRouter);
router.use('/messages', messagesRouter);
router.use('/chat', chatRouter);
router.use('/admin', adminRouter);

export default router;
