import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
} from '../controllers/task.controller';

const router = Router();

router.use(requireAuth); // protect all routes

router.post('/', createTask);
router.get('/', getTasks);
router.get('/:id', getTaskById);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

export default router;
