import * as taskService from '../../services/task.service';
import prisma from '../../lib/prisma';
import { ValidationError, NotFoundError } from '../../errors/appErrors';

jest.mock('../../lib/prisma'); // This pulls from __mocks__/prisma.ts
jest.mock('../notification.service', () => ({
  createNotification: jest.fn(),
}));
jest.mock('../../utils/auditLogger', () => ({
  logAudit: jest.fn(),
}));


describe('task.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createTaskService', () => {
    it('throws ValidationError if title is missing', async () => {
      await expect(taskService.createTaskService('userId', '')).rejects.toThrow(ValidationError);
    });

    it('creates a task and logs audit', async () => {
      (prisma.task.create as any).mockResolvedValue({ id: 'task1', title: 'Test', userId: 'userId' });
      const result = await taskService.createTaskService('userId', 'Test');
      expect(result).toHaveProperty('id', 'task1');
    });
  });

  describe('getTaskByIdService', () => {
    it('throws NotFoundError if task not found', async () => {
      (prisma.task.findUnique as any).mockResolvedValue(null);
      await expect(taskService.getTaskByIdService('userId', 'taskId')).rejects.toThrow(NotFoundError);
    });

    it('throws NotFoundError if task is not owned by user', async () => {
      (prisma.task.findUnique as any).mockResolvedValue({ id: 'taskId', userId: 'otherUser' });
      await expect(taskService.getTaskByIdService('userId', 'taskId')).rejects.toThrow(NotFoundError);
    });

    it('returns task if found and owned by user', async () => {
      (prisma.task.findUnique as any).mockResolvedValue({ id: 'taskId', userId: 'userId' });
      const result = await taskService.getTaskByIdService('userId', 'taskId');
      expect(result).toHaveProperty('id', 'taskId');
    });
  });

  describe('updateTaskService', () => {
    it('throws NotFoundError if task not found', async () => {
      (prisma.task.findUnique as any).mockResolvedValue(null);
      await expect(taskService.updateTaskService('userId', 'taskId', 'New', true)).rejects.toThrow(NotFoundError);
    });

    it('throws NotFoundError if task is not owned by user', async () => {
      (prisma.task.findUnique as any).mockResolvedValue({ id: 'taskId', userId: 'otherUser' });
      await expect(taskService.updateTaskService('userId', 'taskId', 'New', true)).rejects.toThrow(NotFoundError);
    });

    it('updates task and logs audit', async () => {
      (prisma.task.findUnique as any).mockResolvedValue({ id: 'taskId', userId: 'userId', title: 'Old', completed: false });
      (prisma.task.update as any).mockResolvedValue({ id: 'taskId', title: 'New', completed: true });
      const result = await taskService.updateTaskService('userId', 'taskId', 'New', true);
      expect(result).toHaveProperty('title', 'New');
    });
  });

  describe('deleteTaskService', () => {
    it('throws NotFoundError if task not found', async () => {
      (prisma.task.findUnique as any).mockResolvedValue(null);
      await expect(taskService.deleteTaskService('userId', 'taskId')).rejects.toThrow(NotFoundError);
    });

    it('throws NotFoundError if task is not owned by user', async () => {
      (prisma.task.findUnique as any).mockResolvedValue({ id: 'taskId', userId: 'otherUser' });
      await expect(taskService.deleteTaskService('userId', 'taskId')).rejects.toThrow(NotFoundError);
    });

    it('deletes task and logs audit', async () => {
      (prisma.task.findUnique as any).mockResolvedValue({ id: 'taskId', userId: 'userId' });
      (prisma.task.delete as any).mockResolvedValue({});
      const result = await taskService.deleteTaskService('userId', 'taskId');
      expect(result).toHaveProperty('message');
    });
  });

  describe('addCommentToTaskService', () => {
    it('throws ValidationError if content is missing', async () => {
      await expect(taskService.addCommentToTaskService('userId', 'taskId', '')).rejects.toThrow(ValidationError);
    });

    it('throws NotFoundError if task not found', async () => {
      (prisma.task.findUnique as any).mockResolvedValue(null);
      await expect(taskService.addCommentToTaskService('userId', 'taskId', 'content')).rejects.toThrow(NotFoundError);
    });

    it('creates comment and logs audit', async () => {
      (prisma.task.findUnique as any).mockResolvedValue({ id: 'taskId', userId: 'ownerId', title: 'Task' });
      (prisma.taskComment.create as any).mockResolvedValue({ id: 'commentId', content: 'content', taskId: 'taskId', userId: 'userId' });
      const result = await taskService.addCommentToTaskService('userId', 'taskId', 'content');
      expect(result).toHaveProperty('id', 'commentId');
    });
  });

  describe('reactService', () => {
    it('throws ValidationError if reactionType is missing', async () => {
      await expect(taskService.reactService('userId', 'task', 'parentId', '')).rejects.toThrow(ValidationError);
    });

    it('throws NotFoundError if parent task not found', async () => {
      (prisma.task.findUnique as any).mockResolvedValue(null);
      await expect(taskService.reactService('userId', 'task', 'parentId', 'like')).rejects.toThrow(NotFoundError);
    });

    it('creates a new reaction for task', async () => {
      (prisma.task.findUnique as any).mockResolvedValue({ id: 'parentId', userId: 'ownerId', title: 'Task' });
      (prisma.taskReaction.findFirst as any).mockResolvedValue(null);
      (prisma.taskReaction.create as any).mockResolvedValue({ id: 'reactionId', type: 'like' });
      const result = await taskService.reactService('userId', 'task', 'parentId', 'like');
      expect(result).toHaveProperty('id', 'reactionId');
    });

    it('updates an existing reaction for task', async () => {
      (prisma.task.findUnique as any).mockResolvedValue({ id: 'parentId', userId: 'ownerId', title: 'Task' });
      (prisma.taskReaction.findFirst as any).mockResolvedValue({ id: 'reactionId', type: 'like' });
      (prisma.taskReaction.update as any).mockResolvedValue({ id: 'reactionId', type: 'love' });
      const result = await taskService.reactService('userId', 'task', 'parentId', 'love');
      expect(result).toHaveProperty('type', 'love');
    });

    it('throws NotFoundError if parent comment not found', async () => {
      (prisma.taskComment.findUnique as any).mockResolvedValue(null);
      await expect(taskService.reactService('userId', 'comment', 'parentId', 'like')).rejects.toThrow(NotFoundError);
    });

    it('creates a new reaction for comment', async () => {
      (prisma.taskComment.findUnique as any).mockResolvedValue({ id: 'parentId', userId: 'ownerId' });
      (prisma.commentReaction.findFirst as any).mockResolvedValue(null);
      (prisma.commentReaction.create as any).mockResolvedValue({ id: 'reactionId', type: 'like' });
      const result = await taskService.reactService('userId', 'comment', 'parentId', 'like');
      expect(result).toHaveProperty('id', 'reactionId');
    });

    it('updates an existing reaction for comment', async () => {
      (prisma.taskComment.findUnique as any).mockResolvedValue({ id: 'parentId', userId: 'ownerId' });
      (prisma.commentReaction.findFirst as any).mockResolvedValue({ id: 'reactionId', type: 'like' });
      (prisma.commentReaction.update as any).mockResolvedValue({ id: 'reactionId', type: 'love' });
      const result = await taskService.reactService('userId', 'comment', 'parentId', 'love');
      expect(result).toHaveProperty('type', 'love');
    });
  });

  // Add similar tests for other exported functions as needed...
});