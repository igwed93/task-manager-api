import prisma from '../lib/prisma';

export async function createNotification(userId: string, type: string, message: string) {
  return prisma.notification.create({
    data: { userId, type, message },
  });
}

export async function getUserNotificationsService(userId: string) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function markNotificationReadService(notificationId: string) {
  return prisma.notification.update({
    where: { id: notificationId },
    data: { read: true },
  });
}