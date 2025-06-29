import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  toggleTaskCompletion,
  shareTask,
  getSharedTasks,
  addTaskComment,
  getTaskComments,
  deleteComment
} from '../controllers/task.controller';

const router = Router();

router.use(requireAuth); // protect all routes

router.post('/', requireAuth, createTask);
router.get('/', requireAuth, getTasks);
router.get('/:id', requireAuth, getTaskById);
router.put('/:id', requireAuth, updateTask);
router.delete('/:id', requireAuth, deleteTask);
router.patch('/:id/toggle', requireAuth, toggleTaskCompletion);
router.post('/tasks/share', requireAuth, shareTask);
router.get('/tasks/shared', requireAuth, getSharedTasks);
router.post('/:taskId/comments', requireAuth, addTaskComment);
router.get('/:taskId/comments', requireAuth, getTaskComments);
router.delete('/comments/:commentId', requireAuth, deleteComment);


export default router;
