import request from 'supertest';
import express, { Request, Response } from 'express';
import taskRoutes from '../../routes/task.routes';

// Interfaces
interface MockUser {
  userId: string;
  role: string;
}
interface MockRequest extends Request {
  user?: MockUser;
}
type NextFunction = (err?: any) => void;

// Middleware Mocks
jest.mock('../../middleware/validation.middeware', () => ({
  validateBody: () => (_req: Request, _res: Response, next: NextFunction) => next(),
}));

jest.mock('../../middleware/auth.middleware', () => ({
  requireAuth: (req: MockRequest, _res: Response, next: NextFunction) => {
    req.user = { userId: 'u1', role: 'USER' };
    next();
  },
}));

// Controller Mocks
jest.mock('../../controllers/task.controller', () => ({
  createTask: (req: Request, res: Response) =>
    res.status(201).json({ id: 't1', title: req.body.title }),
  getTasks: (_req: Request, res: Response) =>
    res.status(200).json([{ id: 't1', title: 'Task 1' }]),
  getTaskById: (req: Request, res: Response) =>
    res.status(200).json({ id: req.params.id, title: 'Task 1' }),
  updateTask: (req: Request, res: Response) =>
    res.status(200).json({ id: req.params.id, ...req.body }),
  deleteTask: (_req: Request, res: Response) =>
    res.status(200).json({ message: 'Task deleted' }),
  toggleTaskCompletion: (req: Request, res: Response) =>
    res.status(200).json({ id: req.params.id, completed: true }),
  shareTask: (_req: Request, res: Response) =>
    res.status(200).json({ message: 'Task shared' }),
  getSharedTasks: (_req: Request, res: Response) =>
    res.status(200).json([{ id: 't2', title: 'Shared Task' }]),
  addTaskComment: (req: Request, res: Response) =>
    res.status(201).json({ id: 'c1', content: req.body.content }),
  getTaskComments: (_req: Request, res: Response) =>
    res.status(200).json([{ id: 'c1', content: 'Nice!' }]),
  updateComment: (req: Request, res: Response) =>
    res.status(200).json({ id: req.params.commentId, content: req.body.content }),
  getCommentById: (req: Request, res: Response) =>
    res.status(200).json({ id: req.params.commentId, content: 'Nice!' }),
  deleteComment: (_req: Request, res: Response) =>
    res.status(200).json({ message: 'Comment deleted' }),
  reactToTask: (req: Request, res: Response) =>
    res.status(201).json({ id: 'r1', reactionType: req.body.reactionType }),
  reactToComment: (req: Request, res: Response) =>
    res.status(201).json({ id: 'r2', reactionType: req.body.reactionType }),
  removeTaskReaction: (_req: Request, res: Response) =>
    res.status(200).json({ message: 'Task reaction removed' }),
  removeCommentReaction: (_req: Request, res: Response) =>
    res.status(200).json({ message: 'Comment reaction removed' }),
}));

// App Setup
const app = express();
app.use(express.json());
app.use('/api/tasks', taskRoutes);

// Tests
describe('Task Routes', () => {
  it('POST /api/tasks creates a task', async () => {
    const res = await request(app).post('/api/tasks').send({ title: 'New Task' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('title', 'New Task');
  });

  it('GET /api/tasks returns all tasks', async () => {
    const res = await request(app).get('/api/tasks');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /api/tasks/:id returns a task by id', async () => {
    const res = await request(app).get('/api/tasks/t1');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', 't1');
  });

  it('PUT /api/tasks/:id updates a task', async () => {
    const res = await request(app).put('/api/tasks/t1').send({ title: 'Updated Task' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('title', 'Updated Task');
  });

  it('DELETE /api/tasks/:id deletes a task', async () => {
    const res = await request(app).delete('/api/tasks/t1');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'Task deleted');
  });

  it('PATCH /api/tasks/:id/toggle toggles task completion', async () => {
    const res = await request(app).patch('/api/tasks/t1/toggle');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('completed', true);
  });

  it('POST /api/tasks/tasks/share shares a task', async () => {
    const res = await request(app)
      .post('/api/tasks/tasks/share')
      .send({ taskId: 't1', targetUserId: 'u2' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'Task shared');
  });

  it('GET /api/tasks/tasks/shared returns shared tasks', async () => {
    const res = await request(app).get('/api/tasks/tasks/shared');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /api/tasks/:taskId/comments adds a comment', async () => {
    const res = await request(app)
      .post('/api/tasks/t1/comments')
      .send({ content: 'Nice!' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('content', 'Nice!');
  });

  it('GET /api/tasks/:taskId/comments gets comments for a task', async () => {
    const res = await request(app).get('/api/tasks/t1/comments');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('PUT /api/tasks/comments/:commentId updates a comment', async () => {
    const res = await request(app)
      .put('/api/tasks/comments/c1')
      .send({ content: 'Updated comment' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('content', 'Updated comment');
  });

  it('GET /api/tasks/comments/:commentId gets a comment by id', async () => {
    const res = await request(app).get('/api/tasks/comments/c1');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', 'c1');
  });

  it('DELETE /api/tasks/comments/:commentId deletes a comment', async () => {
    const res = await request(app).delete('/api/tasks/comments/c1');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'Comment deleted');
  });

  it('POST /api/tasks/:taskId/reactions reacts to a task', async () => {
    const res = await request(app)
      .post('/api/tasks/t1/reactions')
      .send({ reactionType: 'like' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('reactionType', 'like');
  });

  it('POST /api/tasks/comments/:commentId/reactions reacts to a comment', async () => {
    const res = await request(app)
      .post('/api/tasks/comments/c1/reactions')
      .send({ reactionType: 'love' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('reactionType', 'love');
  });

  it('DELETE /api/tasks/:taskId/reactions removes a task reaction', async () => {
    const res = await request(app).delete('/api/tasks/t1/reactions');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'Task reaction removed');
  });

  it('DELETE /api/tasks/comments/:commentId/reactions removes a comment reaction', async () => {
    const res = await request(app).delete('/api/tasks/comments/c1/reactions');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'Comment reaction removed');
  });
});
