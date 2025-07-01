import prisma from '../lib/prisma';
import { NotFoundError, ValidationError } from '../errors/appErrors';
import { logAudit } from '../utils/auditLogger';
import { createNotification } from './notification.service';

// reactService handles reactions for tasks and comments
type ParentType = 'task' | 'comment';

export async function reactService(
  userId: string,
  parentType: ParentType,
  parentId: string,
  reactionType: string
) {
  if (!reactionType) throw new ValidationError('Reaction type is required');

  if (parentType === 'task') {
    const task = await prisma.task.findUnique({ where: { id: parentId } });
    if (!task) throw new NotFoundError('Task not found');

    const existingReaction = await prisma.taskReaction.findFirst({
      where: { taskId: parentId, userId },
    });

    if (existingReaction) {
      const updated = await prisma.taskReaction.update({
        where: { id: existingReaction.id },
        data: { type: reactionType },
      });
      await logAudit({
        userId,
        action: 'UPDATE',
        entity: 'TaskReaction',
        entityId: updated.id,
        details: `Updated reaction to "${reactionType}" on task ${parentId}`,
      });
      // Notify task owner if not reacting to own task
      if (task.userId !== userId) {
        await createNotification(
          task.userId,
          'TASK_REACTION_UPDATED',
          `Someone updated their reaction to your task "${task.title}".`
        );
      }
      return updated;
    } else {
      const created = await prisma.taskReaction.create({
        data: { taskId: parentId, userId, type: reactionType },
      });
      await logAudit({
        userId,
        action: 'CREATE',
        entity: 'TaskReaction',
        entityId: created.id,
        details: `Added reaction "${reactionType}" to task ${parentId}`,
      });
      // Notify task owner if not reacting to own task
      if (task.userId !== userId) {
        await createNotification(
          task.userId,
          'TASK_REACTED',
          `Someone reacted to your task "${task.title}".`
        );
      }
      return created;
    }
  } else if (parentType === 'comment') {
    const comment = await prisma.taskComment.findUnique({ where: { id: parentId } });
    if (!comment) throw new NotFoundError('Comment not found');

    const existingReaction = await prisma.commentReaction.findFirst({
      where: { commentId: parentId, userId },
    });

    if (existingReaction) {
      const updated = await prisma.commentReaction.update({
        where: { id: existingReaction.id },
        data: { type: reactionType },
      });
      await logAudit({
        userId,
        action: 'UPDATE',
        entity: 'CommentReaction',
        entityId: updated.id,
        details: `Updated reaction to "${reactionType}" on comment ${parentId}`,
      });
      // Notify comment owner if not reacting to own comment
      if (comment.userId !== userId) {
        await createNotification(
          comment.userId,
          'COMMENT_REACTION_UPDATED',
          `Someone updated their reaction to your comment.`
        );
      }
      return updated;
    } else {
      const created = await prisma.commentReaction.create({
        data: { commentId: parentId, userId, type: reactionType },
      });
      await logAudit({
        userId,
        action: 'CREATE',
        entity: 'CommentReaction',
        entityId: created.id,
        details: `Added reaction "${reactionType}" to comment ${parentId}`,
      });
      // Notify comment owner if not reacting to own comment
      if (comment.userId !== userId) {
        await createNotification(
          comment.userId,
          'COMMENT_REACTED',
          `Someone reacted to your comment.`
        );
      }
      return created;
    }
  } else {
    throw new ValidationError('Invalid parent type');
  }
}

export async function createTaskService(userId: string, title: string) {
    if (!title) throw new ValidationError('Title is required');
    const task = await prisma.task.create({
        data: { title, userId },
    });
    await logAudit({
      userId,
      action: 'CREATE',
      entity: 'Task',
      entityId: task.id,
      details: `Created task "${title}"`,
    });
    // Optionally notify user of their own task creation (not common)
    return task;
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

    const updated = await prisma.task.update({
        where: { id },
        data: {
            title: title ?? existingTask.title,
            completed: typeof completed === 'boolean' ? completed : existingTask.completed,
        },
    });
    await logAudit({
      userId,
      action: 'UPDATE',
      entity: 'Task',
      entityId: id,
      details: `Updated task "${id}"`,
    });
    return updated;
}

export async function deleteTaskService(userId: string, id: string) {
    const existingTask = await prisma.task.findUnique({ where: { id } });
    if (!existingTask || existingTask.userId !== userId) throw new NotFoundError('Task not found');

    await prisma.task.delete({ where: { id } });
    await logAudit({
      userId,
      action: 'DELETE',
      entity: 'Task',
      entityId: id,
      details: 'Task deleted by user',
    });
    return { message: 'Task deleted successfully' };
}

export async function toggleTaskCompletionService(userId: string, id: string) {
  const task = await prisma.task.findUnique({ where: { id } });
  if (!task || task.userId !== userId) throw new NotFoundError('Task not found');

  const updated = await prisma.task.update({
    where: { id },
    data: { completed: !task.completed },
  });
  await logAudit({
    userId,
    action: 'UPDATE',
    entity: 'Task',
    entityId: id,
    details: `Toggled completion status to ${!task.completed}`,
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

  const share = await prisma.taskShare.create({
    data: {
      taskId,
      userId: targetUserId,
    },
  });
  await logAudit({
    userId: ownerId,
    action: 'CREATE',
    entity: 'TaskShare',
    entityId: share.id,
    details: `Shared task ${taskId} with user ${targetUserId}`,
  });
  // Notify the target user
  await createNotification(
    targetUserId,
    'TASK_SHARED',
    `A task "${task.title}" was shared with you.`
  );
  return { message: 'Task shared successfully' };
}

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

  const comment = await prisma.taskComment.create({
    data: {
      content,
      taskId,
      userId,
    },
  });
  await logAudit({
    userId,
    action: 'CREATE',
    entity: 'TaskComment',
    entityId: comment.id,
    details: `Added comment to task ${taskId}`,
  });
  // Notify task owner if not commenting on own task
  if (task.userId !== userId) {
    await createNotification(
      task.userId,
      'COMMENT_ADDED',
      `Someone commented on your task "${task.title}".`
    );
  }
  return comment;
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
  await logAudit({
    userId,
    action: 'DELETE',
    entity: 'TaskComment',
    entityId: commentId,
    details: 'Comment deleted by user',
  });
  return { message: 'Comment deleted successfully' };
}

export async function updateCommentService(userId: string, commentId: string, content: string) {
  if (!content) throw new ValidationError('Content is required');

  const comment = await prisma.taskComment.findUnique({ where: { id: commentId } });
  if (!comment || comment.userId !== userId) {
    throw new NotFoundError('Comment not found or unauthorized');
  }

  const updated = await prisma.taskComment.update({
    where: { id: commentId },
    data: { content },
  });
  await logAudit({
    userId,
    action: 'UPDATE',
    entity: 'TaskComment',
    entityId: commentId,
    details: 'Comment updated by user',
  });
  return updated;
}

export async function getCommentByIdService(commentId: string) {
  const comment = await prisma.taskComment.findUnique({
    where: { id: commentId },
    include: { user: { select: { id: true, name: true, email: true } } }
  });
  if (!comment) throw new NotFoundError('Comment not found');
  return comment;
}

export async function removeReactionService(userId: string, parentType: 'task' | 'comment', parentId: string) {
  if (parentType === 'task') {
    const reaction = await prisma.taskReaction.findFirst({ where: { taskId: parentId, userId } });
    if (!reaction) throw new NotFoundError('Reaction not found');
    await prisma.taskReaction.delete({ where: { id: reaction.id } });
    await logAudit({
      userId,
      action: 'DELETE',
      entity: 'TaskReaction',
      entityId: reaction.id,
      details: `Removed reaction from task ${parentId}`,
    });
    return { message: 'Reaction removed from task' };
  } else if (parentType === 'comment') {
    const reaction = await prisma.commentReaction.findFirst({ where: { commentId: parentId, userId } });
    if (!reaction) throw new NotFoundError('Reaction not found');
    await prisma.commentReaction.delete({ where: { id: reaction.id } });
    await logAudit({
      userId,
      action: 'DELETE',
      entity: 'CommentReaction',
      entityId: reaction.id,
      details: `Removed reaction from comment ${parentId}`,
    });
    return { message: 'Reaction removed from comment' };
  } else {
    throw new ValidationError('Invalid parent type');
  }
}