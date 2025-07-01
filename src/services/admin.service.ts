import prisma from '../lib/prisma';
import { NotFoundError } from '../errors/appErrors';

export async function getAllUsersService() {
  return prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, createdAt: true }
  });
}

export async function deleteAnyTaskService(taskId: string) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) throw new NotFoundError('Task not found');
  await prisma.task.delete({ where: { id: taskId } });
  return { message: 'Task deleted by admin' };
}

export async function deleteAnyCommentService(commentId: string) {
  const comment = await prisma.taskComment.findUnique({ where: { id: commentId } });
  if (!comment) throw new NotFoundError('Comment not found');
  await prisma.taskComment.delete({ where: { id: commentId } });
  return { message: 'Comment deleted by admin' };
}