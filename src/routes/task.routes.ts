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
  deleteComment,
  reactToTask,
  reactToComment,
  updateComment,
  getCommentById,
  removeTaskReaction,
  removeCommentReaction
} from '../controllers/task.controller';
import { validateBody } from '../middleware/validation.middeware';
import { createTaskSchema, updateTaskSchema } from '../validations/task.validation';
import { addCommentSchema, updateCommentSchema } from '../validations/comment.validation';
import { reactionSchema } from '../validations/reaction.validation';
import { shareTaskSchema } from '../validations/share.validation';

const router = Router();

router.use(requireAuth); // protect all routes

router.post('/', validateBody(createTaskSchema), createTask);
router.get('/', getTasks);
router.get('/:id', getTaskById);
router.put('/:id', validateBody(updateTaskSchema), updateTask);
router.delete('/:id', deleteTask);
router.patch('/:id/toggle', toggleTaskCompletion);
router.post('/tasks/share', validateBody(shareTaskSchema), shareTask);
router.get('/tasks/shared', getSharedTasks);
router.post('/:taskId/comments', validateBody(addCommentSchema), addTaskComment);
router.get('/:taskId/comments', getTaskComments);
router.put('/comments/:commentId', validateBody(updateCommentSchema), updateComment);
router.get('/comments/:commentId', getCommentById);
router.delete('/comments/:commentId', deleteComment);
router.post('/:taskId/reactions', validateBody(reactionSchema), reactToTask);
router.post('/comments/:commentId/reactions', validateBody(reactionSchema), reactToComment);
router.delete('/:taskId/reactions', removeTaskReaction);
router.delete('/comments/:commentId/reactions', removeCommentReaction);


export default router;
