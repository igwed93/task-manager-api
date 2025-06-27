import prisma from '../lib/prisma';

export async function createTaskService(userId: string, title: string) {
    if (!title) throw new Error('Title is required');
    return await prisma.task.create({
        data: { title, userId },
    });
}

export async function getTasksService(userId: string) {
    return await prisma.task.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
    });
}

export async function getTaskByIdService(userId: string, id: string) {
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task || task.userId !== userId) throw new Error('Task not found');
    return task;
}

export async function updateTaskService(userId: string, id: string, title?: string, completed?: boolean) {
    const existingTask = await prisma.task.findUnique({ where: { id } });
    if (!existingTask || existingTask.userId !== userId) throw new Error('Task not found');

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
    if (!existingTask || existingTask.userId !== userId) throw new Error('Task not found');

    await prisma.task.delete({ where: { id } });
    return { message: 'Task deleted successfully' };
}