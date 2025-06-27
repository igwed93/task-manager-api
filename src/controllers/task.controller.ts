import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';
import {
    createTaskService,
    getTasksService,
    getTaskByIdService,
    updateTaskService,
    deleteTaskService,
} from '../services/task.service';

export const createTask = asyncHandler(async (req: AuthRequest, res: Response) => {
    try {
        const task = await createTaskService(req.user!.userId, req.body.title);
        res.status(201).json(task);
    } catch (error: any) {
        res.status(400).json({ error: error.message || 'Internal server error' });
    }
});

export const getTasks = asyncHandler(async (req: AuthRequest, res: Response) => {
    try {
        const tasks = await getTasksService(req.user!.userId);
        res.status(200).json(tasks);
    } catch (error: any) {
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
});

export const getTaskById = asyncHandler(async (req: AuthRequest, res: Response) => {
    try {
        const task = await getTaskByIdService(req.user!.userId, req.params.id);
        res.status(200).json(task);
    } catch (error: any) {
        res.status(404).json({ message: error.message || 'Task not found' });
    }
});

export const updateTask = asyncHandler(async (req: AuthRequest, res: Response) => {
    try {
        const updated = await updateTaskService(
            req.user!.userId,
            req.params.id,
            req.body.title,
            req.body.completed
        );
        res.status(200).json(updated);
    } catch (error: any) {
        res.status(404).json({ message: error.message || 'Task not found' });
    }
});

export const deleteTask = asyncHandler(async (req: AuthRequest, res: Response) => {
    try {
        await deleteTaskService(req.user!.userId, req.params.id);
        res.status(204).json({ message: 'Task deleted successfully' });
    } catch (error: any) {
        res.status(404).json({ message: error.message || 'Task not found' });
    }
});