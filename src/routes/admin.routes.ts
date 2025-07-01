import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/authorize';
import { getAllUsers, deleteAnyTask, deleteAnyComment } from '../controllers/admin.controller';

const router = Router();

router.use(requireAuth, authorizeRoles('ADMIN'));

router.get('/users', getAllUsers);
router.delete('/tasks/:taskId', deleteAnyTask);
router.delete('/comments/:commentId', deleteAnyComment);

export default router;