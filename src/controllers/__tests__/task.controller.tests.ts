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
  updateComment,
  getCommentById,
  reactToTask,
  reactToComment,
  removeTaskReaction,
  removeCommentReaction,
} from '../task.controller';
import * as taskService from '../../services/task.service';
import { Request, Response } from 'express';

jest.mock('../../services/task.service');

const mockRes = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res as Response;
};

describe('Task Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createTask', () => {
    it('should return 400 if title is missing', async () => {
      const req = { user: { userId: 'u1' }, body: {} } as any;
      const res = mockRes();
      await createTask(req, res, jest.fn());
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Title is required' });
    });

    it('should create a task and return 201', async () => {
      (taskService.createTaskService as jest.Mock).mockResolvedValue({ id: 't1', title: 'Task' });
      const req = { user: { userId: 'u1' }, body: { title: 'Task' } } as any;
      const res = mockRes();
      await createTask(req, res, jest.fn());
      expect(taskService.createTaskService).toHaveBeenCalledWith('u1', 'Task');
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ task: { id: 't1', title: 'Task' } });
    });
  });

  describe('getTasks', () => {
    it('should get tasks with filters and return 200', async () => {
      (taskService.getTasksService as jest.Mock).mockResolvedValue([{ id: 't1' }]);
      const req = { user: { userId: 'u1' }, query: {} } as any;
      const res = mockRes();
      await getTasks(req, res, jest.fn());
      expect(taskService.getTasksService).toHaveBeenCalledWith('u1', {
        page: undefined,
        pageSize: undefined,
        completed: undefined,
        fromDate: undefined,
        toDate: undefined,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([{ id: 't1' }]);
    });
  });

  describe('getTaskById', () => {
    it('should return 404 if task not found', async () => {
      (taskService.getTaskByIdService as jest.Mock).mockResolvedValue(null);
      const req = { user: { userId: 'u1' }, params: { id: 't1' } } as any;
      const res = mockRes();
      await getTaskById(req, res, jest.fn());
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Task not found' });
    });

    it('should return task if found', async () => {
      (taskService.getTaskByIdService as jest.Mock).mockResolvedValue({ id: 't1' });
      const req = { user: { userId: 'u1' }, params: { id: 't1' } } as any;
      const res = mockRes();
      await getTaskById(req, res, jest.fn());
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ task: { id: 't1' } });
    });
  });

  describe('updateTask', () => {
    it('should return 404 if task not found or not yours', async () => {
      (taskService.updateTaskService as jest.Mock).mockResolvedValue(null);
      const req = { user: { userId: 'u1' }, params: { id: 't1' }, body: { title: 'New', completed: true } } as any;
      const res = mockRes();
      await updateTask(req, res, jest.fn());
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Task not found or not yours' });
    });

    it('should update task and return 200', async () => {
      (taskService.updateTaskService as jest.Mock).mockResolvedValue({ id: 't1', title: 'New', completed: true });
      const req = { user: { userId: 'u1' }, params: { id: 't1' }, body: { title: 'New', completed: true } } as any;
      const res = mockRes();
      await updateTask(req, res, jest.fn());
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ task: { id: 't1', title: 'New', completed: true } });
    });
  });

  describe('deleteTask', () => {
    it('should return 404 if task not found or not yours', async () => {
      (taskService.deleteTaskService as jest.Mock).mockResolvedValue(null);
      const req = { user: { userId: 'u1' }, params: { id: 't1' } } as any;
      const res = mockRes();
      await deleteTask(req, res, jest.fn());
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Task not found or not yours' });
    });

    it('should delete task and return 204', async () => {
      (taskService.deleteTaskService as jest.Mock).mockResolvedValue({ id: 't1' });
      const req = { user: { userId: 'u1' }, params: { id: 't1' } } as any;
      const res = mockRes();
      await deleteTask(req, res, jest.fn());
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });
  });

  describe('toggleTaskCompletion', () => {
    it('should toggle completion and return 200', async () => {
      (taskService.toggleTaskCompletionService as jest.Mock).mockResolvedValue({ id: 't1', completed: true });
      const req = { user: { userId: 'u1' }, params: { id: 't1' } } as any;
      const res = mockRes();
      await toggleTaskCompletion(req, res, jest.fn());
      expect(taskService.toggleTaskCompletionService).toHaveBeenCalledWith('u1', 't1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ task: { id: 't1', completed: true } });
    });
  });

  describe('shareTask', () => {
    it('should share a task and return 200', async () => {
      (taskService.shareTaskService as jest.Mock).mockResolvedValue({ message: 'Task shared' });
      const req = { user: { userId: 'u1' }, body: { taskId: 't1', targetUserId: 'u2' } } as any;
      const res = mockRes();
      await shareTask(req, res, jest.fn());
      expect(taskService.shareTaskService).toHaveBeenCalledWith('t1', 'u1', 'u2');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Task shared' });
    });
  });

  describe('getSharedTasks', () => {
    it('should get shared tasks and return 200', async () => {
      (taskService.getSharedTasksService as jest.Mock).mockResolvedValue([{ id: 't2' }]);
      const req = { user: { userId: 'u1' } } as any;
      const res = mockRes();
      await getSharedTasks(req, res, jest.fn());
      expect(taskService.getSharedTasksService).toHaveBeenCalledWith('u1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ tasks: [{ id: 't2' }] });
    });
  });

  describe('addTaskComment', () => {
    it('should add a comment and return 201', async () => {
      (taskService.addCommentToTaskService as jest.Mock).mockResolvedValue({ id: 'c1', content: 'Nice!' });
      const req = { user: { userId: 'u1' }, params: { taskId: 't1' }, body: { content: 'Nice!' } } as any;
      const res = mockRes();
      await addTaskComment(req, res, jest.fn());
      expect(taskService.addCommentToTaskService).toHaveBeenCalledWith('u1', 't1', 'Nice!');
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ id: 'c1', content: 'Nice!' });
    });
  });

  describe('getTaskComments', () => {
    it('should get comments for a task and return 200', async () => {
      (taskService.getTaskCommentsService as jest.Mock).mockResolvedValue([{ id: 'c1', content: 'Nice!' }]);
      const req = { params: { taskId: 't1' } } as any;
      const res = mockRes();
      await getTaskComments(req, res, jest.fn());
      expect(taskService.getTaskCommentsService).toHaveBeenCalledWith('t1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([{ id: 'c1', content: 'Nice!' }]);
    });
  });

  describe('deleteComment', () => {
    it('should delete a comment and return 200', async () => {
      (taskService.deleteCommentService as jest.Mock).mockResolvedValue({ message: 'Comment deleted' });
      const req = { user: { userId: 'u1' }, params: { commentId: 'c1' } } as any;
      const res = mockRes();
      await deleteComment(req, res, jest.fn());
      expect(taskService.deleteCommentService).toHaveBeenCalledWith('u1', 'c1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Comment deleted' });
    });
  });

  describe('updateComment', () => {
    it('should update a comment and return 200', async () => {
      (taskService.updateCommentService as jest.Mock).mockResolvedValue({ id: 'c1', content: 'Updated' });
      const req = { user: { userId: 'u1' }, params: { commentId: 'c1' }, body: { content: 'Updated' } } as any;
      const res = mockRes();
      await updateComment(req, res, jest.fn());
      expect(taskService.updateCommentService).toHaveBeenCalledWith('u1', 'c1', 'Updated');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ id: 'c1', content: 'Updated' });
    });
  });

  describe('getCommentById', () => {
    it('should get a comment by id and return 200', async () => {
      (taskService.getCommentByIdService as jest.Mock).mockResolvedValue({ id: 'c1', content: 'Nice!' });
      const req = { params: { commentId: 'c1' } } as any;
      const res = mockRes();
      await getCommentById(req, res, jest.fn());
      expect(taskService.getCommentByIdService).toHaveBeenCalledWith('c1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ id: 'c1', content: 'Nice!' });
    });
  });

  describe('reactToTask', () => {
    it('should react to a task and return 200', async () => {
      (taskService.reactService as jest.Mock).mockResolvedValue({ id: 'r1', reactionType: 'like' });
      const req = { user: { userId: 'u1' }, params: { taskId: 't1' }, body: { reactionType: 'like' } } as any;
      const res = mockRes();
      await reactToTask(req, res, jest.fn());
      expect(taskService.reactService).toHaveBeenCalledWith('u1', 'task', 't1', 'like');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ id: 'r1', reactionType: 'like' });
    });
  });

  describe('reactToComment', () => {
    it('should react to a comment and return 200', async () => {
      (taskService.reactService as jest.Mock).mockResolvedValue({ id: 'r2', reactionType: 'love' });
      const req = { user: { userId: 'u1' }, params: { commentId: 'c1' }, body: { reactionType: 'love' } } as any;
      const res = mockRes();
      await reactToComment(req, res, jest.fn());
      expect(taskService.reactService).toHaveBeenCalledWith('u1', 'comment', 'c1', 'love');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ id: 'r2', reactionType: 'love' });
    });
  });

  describe('removeTaskReaction', () => {
    it('should remove a task reaction and return 200', async () => {
      (taskService.removeReactionService as jest.Mock).mockResolvedValue({ message: 'Task reaction removed' });
      const req = { user: { userId: 'u1' }, params: { taskId: 't1' } } as any;
      const res = mockRes();
      await removeTaskReaction(req, res, jest.fn());
      expect(taskService.removeReactionService).toHaveBeenCalledWith('u1', 'task', 't1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Task reaction removed' });
    });
  });

  describe('removeCommentReaction', () => {
    it('should remove a comment reaction and return 200', async () => {
      (taskService.removeReactionService as jest.Mock).mockResolvedValue({ message: 'Comment reaction removed' });
      const req = { user: { userId: 'u1' }, params: { commentId: 'c1' } } as any;
      const res = mockRes();
      await removeCommentReaction(req, res, jest.fn());
      expect(taskService.removeReactionService).toHaveBeenCalledWith('u1', 'comment', 'c1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Comment reaction removed' });
    });
  });
});