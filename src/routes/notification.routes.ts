import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { getUserNotifications, markNotificationRead } from '../controllers/notification.controller';

const router = Router();

router.get('/', requireAuth, getUserNotifications);
router.patch('/:id/read', requireAuth, markNotificationRead);

export default router;