import { getUserNotifications, markNotificationRead } from '../notification.controller';
import * as notificationService from '../../services/notification.service';
import { Request, Response } from 'express';

jest.mock('../../services/notification.service');

const mockRes = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

describe('Notification Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserNotifications', () => {
    it('should return notifications for the user with status 200', async () => {
      const notifications = [{ id: 'n1', message: 'Test notification' }];
      (notificationService.getUserNotificationsService as jest.Mock).mockResolvedValue(notifications);

      const req = { user: { userId: 'u1' } } as any as Request;
      const res = mockRes();

      await getUserNotifications(req, res, jest.fn());

      expect(notificationService.getUserNotificationsService).toHaveBeenCalledWith('u1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(notifications);
    });
  });

  describe('markNotificationRead', () => {
    it('should mark notification as read and return it with status 200', async () => {
      const notification = { id: 'n1', read: true };
      (notificationService.markNotificationReadService as jest.Mock).mockResolvedValue(notification);

      const req = { params: { id: 'n1' } } as any as Request;
      const res = mockRes();

      await markNotificationRead(req, res, jest.fn());

      expect(notificationService.markNotificationReadService).toHaveBeenCalledWith('n1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(notification);
    });
  });
});