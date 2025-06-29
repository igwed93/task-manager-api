import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import {
  createTaskService,
  getTasksService,
  getTaskByIdService,
  updateTaskService,
  deleteTaskService,
  toggleTaskCompletionService,
  shareTaskService,
  getSharedTasksService,
  addCommentToTaskService,
  getTaskCommentsService,
  deleteCommentService,
} from '../services/task.service';
import { asyncHandler } from '../utils/asyncHandler';

export const createTask = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const { title } = req.body;

  if (!title) {
    res.status(400).json({ message: 'Title is required' });
    return;
  }

  const task = await createTaskService(userId!, title);
  res.status(201).json({ task });
});

export const getTasks = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const { page, pageSize, completed, fromDate, toDate } = req.query;

  const result = await getTasksService(userId!, {
    page: page ? Number(page) : undefined,
    pageSize: pageSize ? Number(pageSize) : undefined,
    completed: typeof completed === 'string' ? completed === 'true' : undefined,
    fromDate: fromDate ? new Date(fromDate as string) : undefined,
    toDate: toDate ? new Date(toDate as string) : undefined,
  });

  res.status(200).json(result);
});

export const getTaskById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const { id } = req.params;

  const task = await getTaskByIdService(userId!, id);

  if (!task) {
    res.status(404).json({ message: 'Task not found' });
    return;
  }

  res.status(200).json({ task });
});

export const updateTask = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const { id } = req.params;
  const { title, completed } = req.body;

  const updatedTask = await updateTaskService(userId!, id, title, completed);

  if (!updatedTask) {
    res.status(404).json({ message: 'Task not found or not yours' });
    return;
  }

  res.status(200).json({ task: updatedTask });
});

export const deleteTask = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const { id } = req.params;

  const deleted = await deleteTaskService(userId!, id);

  if (!deleted) {
    res.status(404).json({ message: 'Task not found or not yours' });
    return;
  }

  res.status(204).send(); // No content
});

export const toggleTaskCompletion = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const { id } = req.params;
  const updatedTask = await toggleTaskCompletionService(userId!, id);
  res.status(200).json({ task: updatedTask });
});

export const shareTask = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { taskId, targetUserId } = req.body;
  const ownerId = req.user!.userId; // req.user is guaranteed to exist here

  const result = await shareTaskService(taskId, ownerId, targetUserId);
  res.status(200).json(result);
});

export const getSharedTasks = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId; // req.user is guaranteed to exist here

  const tasks = await getSharedTasksService(userId);
  res.status(200).json({ tasks });
});

export const addTaskComment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { taskId } = req.params;
  const { content } = req.body;
  const userId = req.user?.userId!;

  const comment = await addCommentToTaskService(userId, taskId, content);
  res.status(201).json(comment);
});

export const getTaskComments = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { taskId } = req.params;
  const comments = await getTaskCommentsService(taskId);
  res.status(200).json(comments);
});

export const deleteComment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId!;
  const { commentId } = req.params;

  const result = await deleteCommentService(userId, commentId);
  res.status(200).json(result);
});

