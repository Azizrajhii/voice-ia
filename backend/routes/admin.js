import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/admin.js';
import { getOverview, listUsers, setRole, removeUser } from '../controllers/adminController.js';

const router = express.Router();

router.use(requireAuth, requireAdmin);

router.get('/overview', getOverview);
router.get('/users', listUsers);
router.patch('/users/:id/role', setRole);
router.delete('/users/:id', removeUser);

export default router;
