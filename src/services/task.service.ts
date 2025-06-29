import prisma from '../lib/prisma';
import { NotFoundError, ValidationError } from '../errors/appErrors';

export async function createTaskService(userId: string, title: string) {
    if (!title) throw new ValidationError('Title is required');
    return await prisma.task.create({
        data: { title, userId },
    });
}

export async function getTasksService(
  userId: string,
  options: {
    page?: number;
    pageSize?: number;
    completed?: boolean;
    fromDate?: Date;
    toDate?: Date;
  } = {}
) {
  const { page = 1, pageSize = 10, completed, fromDate, toDate } = options;

  const where: any = { userId };
  if (typeof completed === 'boolean') where.completed = completed;
  if (fromDate || toDate) {
    where.createdAt = {};
    if (fromDate) where.createdAt.gte = fromDate;
    if (toDate) where.createdAt.lte = toDate;
  }

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.task.count({ where }),
  ]);

  return {
    tasks,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getTaskByIdService(userId: string, id: string) {
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task || task.userId !== userId) throw new NotFoundError('Task not found');
    return task;
}

export async function updateTaskService(userId: string, id: string, title?: string, completed?: boolean) {
    const existingTask = await prisma.task.findUnique({ where: { id } });
    if (!existingTask || existingTask.userId !== userId) throw new NotFoundError('Task not found');

    return await prisma.task.update({
        where: { id },
        data: {
            title: title ?? existingTask.title,
            completed: typeof completed === 'boolean' ? completed : existingTask.completed,
        },
    });
}

export async function deleteTaskService(userId: string, id: string) {
    const existingTask = await prisma.task.findUnique({ where: { id } });
    if (!existingTask || existingTask.userId !== userId) throw new NotFoundError('Task not found');

    await prisma.task.delete({ where: { id } });
    return { message: 'Task deleted successfully' };
}

export async function toggleTaskCompletionService(userId: string, id: string) {
  const task = await prisma.task.findUnique({ where: { id } });
  if (!task || task.userId !== userId) throw new NotFoundError('Task not found');

  const updated = await prisma.task.update({
    where: { id },
    data: { completed: !task.completed },
  });

  return updated;
}

export async function shareTaskService(taskId: string, ownerId: string, targetUserId: string) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task || task.userId !== ownerId) {
    throw new NotFoundError('Task not found or unauthorized');
  }

  const user = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!user) {
    throw new NotFoundError('Target user not found');
  }

  await prisma.taskShare.create({
    data: {
      taskId,
      userId: targetUserId,
    },
  });

  return { message: 'Task shared successfully' };
};

export async function getSharedTasksService(userId: string) {
  const sharedTasks = await prisma.taskShare.findMany({
    where: { userId },
    include: { task: true},
  });

  return sharedTasks.map((share) => share.task);
}

export async function addCommentToTaskService(userId: string, taskId: string, content: string) {
  if (!content) throw new ValidationError('Comment content is required');

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) throw new NotFoundError('Task not found');

  return await prisma.taskComment.create({
    data: {
      content,
      taskId,
      userId,
    },
  });
}

export async function getTaskCommentsService(taskId: string) {
  return await prisma.taskComment.findMany({
    where: { taskId },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function deleteCommentService(userId: string, commentId: string) {
  const comment = await prisma.taskComment.findUnique({ where: { id: commentId } });
  if (!comment || comment.userId !== userId) throw new NotFoundError('Comment not found or unauthorized');

  await prisma.taskComment.delete({ where: { id: commentId } });
  return { message: 'Comment deleted successfully' };
}

export async function updateCommentService(userId: string, commentId: string, content: string) {
  if (!content) throw new ValidationError('Content is required');

  const comment = await prisma.taskComment.findUnique({ where: { id: commentId } });
  if (!comment || comment.userId !== userId) {
    throw new NotFoundError('Comment not found or unauthorized');
  }

  return await prisma.taskComment.update({
    where: { id: commentId },
    data: { content },
  });
}

export async function reactToCommentService(userId: string, commentId: string, reactionType: string) {
  const comment = await prisma.taskComment.findUnique({ where: { id: commentId } });
  if (!comment) {
    throw new NotFoundError('Comment not found');
  }

  // You can define reaction types as enum/string validation elsewhere
  if (!reactionType) {
    throw new ValidationError('Reaction type is required');
  }

  // Upsert logic: if user already reacted, update reaction, else create new
  const existingReaction = await prisma.commentReaction.findFirst({
    where: { commentId, userId },
  });

  if (existingReaction) {
    return await prisma.commentReaction.update({
      where: { id: existingReaction.id },
      data: { type: reactionType },
    });
  } else {
    return await prisma.commentReaction.create({
      data: { commentId, userId, type: reactionType },
    });
  }
}