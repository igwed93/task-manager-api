import request from 'supertest';
import express from 'express';
import { Request, Response } from 'express';
import adminRoutes from '../admin.routes';

// Mock controllers to isolate route tests
jest.mock('../../controllers/admin.controller', () => ({
  getAllUsers: (req: Request, res: Response) => res.status(200).json([{ id: 'u1', name: 'Admin' }]),
  deleteAnyTask: (req: Request, res: Response) => res.status(200).json({ message: 'Task deleted by admin' }),
  deleteAnyComment: (req: Request, res: Response) => res.status(200).json({ message: 'Comment deleted by admin' }),
}));

// Mock middlewares
jest.mock('../../middleware/auth.middleware', () => ({
  requireAuth: (req: { user: { userId: string; role: string; }; }, res: any, next: () => void) => {
    req.user = { userId: 'admin1', role: 'ADMIN' };
    next();
  },
}));
jest.mock('../../middleware/authorize', () => ({
  authorizeRoles: () => (req: { user: { role: string; }; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { message: string; }): any; new(): any; }; }; }, next: () => any) => {
    if (req.user && req.user.role === 'ADMIN') return next();
    return res.status(403).json({ message: 'Forbidden: insufficient permissions' });
  },
}));

const app = express();
app.use(express.json());
app.use('/api/admin', adminRoutes);

describe('Admin Routes', () => {
  it('GET /api/admin/users returns all users', async () => {
    const res = await request(app).get('/api/admin/users');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('id', 'u1');
  });

  it('DELETE /api/admin/tasks/:taskId deletes a task', async () => {
    const res = await request(app).delete('/api/admin/tasks/task123');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'Task deleted by admin');
  });

  it('DELETE /api/admin/comments/:commentId deletes a comment', async () => {
    const res = await request(app).delete('/api/admin/comments/comment123');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'Comment deleted by admin');
  });

  it('returns 403 if user is not admin', async () => {
    // Override requireAuth to simulate non-admin user
    jest.resetModules();
    const nonAdminApp = express();
    nonAdminApp.use(express.json());
    jest.doMock('../../middleware/auth.middleware', () => ({
      requireAuth: (req: { user: { userId: string; role: string; }; }, res: any, next: () => void) => {
        req.user = { userId: 'user1', role: 'USER' };
        next();
      },
    }));
    const adminRoutesReloaded = require('../admin.routes').default;
    nonAdminApp.use('/api/admin', adminRoutesReloaded);

    const res = await request(nonAdminApp).get('/api/admin/users');
    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('message');
  });
});