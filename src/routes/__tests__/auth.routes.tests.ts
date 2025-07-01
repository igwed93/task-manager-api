import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import authRoutes from '../auth.routes';

// Mock controllers to isolate route tests
jest.mock('../../controllers/auth.controller', () => ({
  register: (req: Request, res: Response) => res.status(201).json({ user: { id: 'u1', email: 'a@b.com', name: 'Test', role: 'USER' }, token: 'jwt' }),
  login: (req: Request, res: Response) => res.status(200).json({ user: { id: 'u1', email: 'a@b.com', name: 'Test', role: 'USER' }, token: 'jwt' }),
  logout: (req: Request, res: Response) => res.status(200).json({ message: 'Logout successful' }),
  getCurrentUserController: (req: Request, res: Response) => res.status(200).json({ user: { id: 'u1', email: 'a@b.com', name: 'Test' } }),
  forgotPassword: (req: Request, res: Response) => res.status(200).json({ message: 'Password reset email sent' }),
  resetPassword: (req: Request, res: Response) => res.status(200).json({ message: 'Password reset successful' }),
  verifyEmail: (req: Request, res: Response) => res.status(200).json({ message: 'Email verified successfully' }),
  deleteUser: (req: Request, res: Response) => res.status(200).json({ message: 'User deleted' }),
}));

// Mock middlewares
jest.mock('../../middleware/auth.middleware', () => ({
  requireAuth: (req: Request, res: Response, next: NextFunction) => {
    (req as any).user = { userId: 'u1', role: 'USER' };
    next();
  },
}));
jest.mock('../../middleware/authorize', () => ({
  authorizeRoles: () => (req: Request, res: Response, next: NextFunction) => next(),
}));
jest.mock('../../middleware/validation.middeware', () => ({
  validateBody: () => (req: Request, res: Response, next: NextFunction) => next(),
}));

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth Routes', () => {
  it('POST /api/auth/register returns user and token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'a@b.com', password: 'pw', name: 'Test' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('user');
    expect(res.body).toHaveProperty('token');
  });

  it('POST /api/auth/login returns user and token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'a@b.com', password: 'pw' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('user');
    expect(res.body).toHaveProperty('token');
  });

  it('POST /api/auth/logout returns logout message', async () => {
    const res = await request(app).post('/api/auth/logout');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'Logout successful');
  });

  it('GET /api/auth/verify-email returns verification message', async () => {
    const res = await request(app).get('/api/auth/verify-email?token=abc');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'Email verified successfully');
  });

  it('GET /api/auth/me returns current user', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('user');
  });

  it('POST /api/auth/forgot-password returns reset email message', async () => {
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'a@b.com' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'Password reset email sent');
  });

  it('POST /api/auth/reset-password returns reset success message', async () => {
    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({ token: 'abc', newPassword: 'pw' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'Password reset successful');
  });

  it('DELETE /api/auth/me returns user deleted message', async () => {
    const res = await request(app).delete('/api/auth/me');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'User deleted');
  });
});