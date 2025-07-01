import request from 'supertest';
import express from 'express';
import notificationRoutes from '../notification.routes';
import { Request, Response } from 'express';

// Mock controllers to isolate route tests
jest.mock('../../controllers/notification.controller', () => ({
  getUserNotifications: (req: Request, res: Response) => res.status(200).json([{ id: 'n1', message: 'Test notification' }]),
  markNotificationRead: (req: { params: { id: any; }; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { id: any; read: boolean; }): any; new(): any; }; }; }) => res.status(200).json({ id: req.params.id, read: true }),
}));

// Mock middleware
jest.mock('../../middleware/auth.middleware', () => ({
  requireAuth: (req: { user: { userId: string; role: string; }; }, res: any, next: () => void) => {
    req.user = { userId: 'u1', role: 'USER' };
    next();
  },
}));

const app = express();
app.use(express.json());
app.use('/api/notifications', notificationRoutes);

describe('Notification Routes', () => {
  it('GET /api/notifications returns user notifications', async () => {
    const res = await request(app).get('/api/notifications');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('id', 'n1');
  });

    it('PATCH /api/notifications/:id/read marks notification as read', async () => {
      const res = await request(app).patch('/api/notifications/n1/read');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', 'n1');
      expect(res.body).toHaveProperty('read', true);
    });
  });