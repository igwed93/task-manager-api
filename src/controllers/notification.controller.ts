import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import {
  getUserNotificationsService,
  markNotificationReadService,
} from '../services/notification.service';
import { AuthRequest } from '../middleware/auth.middleware';

export const getUserNotifications = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const notifications = await getUserNotificationsService(userId);
  res.status(200).json(notifications);
});

export const markNotificationRead = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const notification = await markNotificationReadService(id);
  res.status(200).json(notification);
});