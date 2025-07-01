import * as adminService from '../../services/admin.service';
import prisma from '../../lib/prisma';
import { NotFoundError } from '../../errors/appErrors';

jest.mock('../../lib/prisma');

beforeAll(() => {
  (prisma as any).task = {
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
  };
  (prisma as any).taskComment = {
    findUnique: jest.fn(),
    delete: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    findFirst: jest.fn(),
  };
  (prisma as any).commentReaction = {
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };
  (prisma as any).taskReaction = {
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };
  (prisma as any).notification = {
    create: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
  };
  (prisma as any).user = {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
  };
});

describe('admin.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllUsersService', () => {
    it('returns all users with selected fields', async () => {
      (prisma.user.findMany as any).mockResolvedValue([
        { id: 'u1', name: 'User1', email: 'a@b.com', role: 'USER', createdAt: new Date() },
      ]);
      const result = await adminService.getAllUsersService();
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        select: { id: true, name: true, email: true, role: true, createdAt: true }
      });
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('id', 'u1');
    });
  });

  describe('deleteAnyTaskService', () => {
    it('throws NotFoundError if task does not exist', async () => {
      (prisma.task.findUnique as any).mockResolvedValue(null);
      await expect(adminService.deleteAnyTaskService('task1')).rejects.toThrow(NotFoundError);
    });

    it('deletes task and returns message', async () => {
      (prisma.task.findUnique as any).mockResolvedValue({ id: 'task1' });
      (prisma.task.delete as any).mockResolvedValue({});
      const result = await adminService.deleteAnyTaskService('task1');
      expect(prisma.task.delete).toHaveBeenCalledWith({ where: { id: 'task1' } });
      expect(result).toHaveProperty('message', 'Task deleted by admin');
    });
  });

  describe('deleteAnyCommentService', () => {
    it('throws NotFoundError if comment does not exist', async () => {
      (prisma.taskComment.findUnique as any).mockResolvedValue(null);
      await expect(adminService.deleteAnyCommentService('comment1')).rejects.toThrow(NotFoundError);
    });

    it('deletes comment and returns message', async () => {
      (prisma.taskComment.findUnique as any).mockResolvedValue({ id: 'comment1' });
      (prisma.taskComment.delete as any).mockResolvedValue({});
      const result = await adminService.deleteAnyCommentService('comment1');
      expect(prisma.taskComment.delete).toHaveBeenCalledWith({ where: { id: 'comment1' } });
      expect(result).toHaveProperty('message', 'Comment deleted by admin');
    });
  });
});