import * as notificationService from '../../services/notification.service';
import prisma from '../../lib/prisma';

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

describe('notification.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createNotification', () => {
    it('creates a notification with correct data', async () => {
      (prisma.notification.create as any).mockResolvedValue({
        id: 'notif1',
        userId: 'user1',
        type: 'TASK_SHARED',
        message: 'A task was shared with you.',
      });
      const result = await notificationService.createNotification('user1', 'TASK_SHARED', 'A task was shared with you.');
      expect(prisma.notification.create).toHaveBeenCalledWith({
        data: { userId: 'user1', type: 'TASK_SHARED', message: 'A task was shared with you.' },
      });
      expect(result).toHaveProperty('id', 'notif1');
    });
  });

  describe('getUserNotificationsService', () => {
    it('returns notifications for a user', async () => {
      (prisma.notification.findMany as any).mockResolvedValue([
        { id: 'notif1', userId: 'user1', type: 'TASK_SHARED', message: 'msg', createdAt: new Date() },
      ]);
      const result = await notificationService.getUserNotificationsService('user1');
      expect(prisma.notification.findMany).toHaveBeenCalledWith({
        where: { userId: 'user1' },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('userId', 'user1');
    });
  });

  describe('markNotificationReadService', () => {
    it('marks a notification as read', async () => {
      (prisma.notification.update as any).mockResolvedValue({
        id: 'notif1',
        read: true,
      });
      const result = await notificationService.markNotificationReadService('notif1');
      expect(prisma.notification.update).toHaveBeenCalledWith({
        where: { id: 'notif1' },
        data: { read: true },
      });
      expect(result).toHaveProperty('read', true);
    });
  });
});