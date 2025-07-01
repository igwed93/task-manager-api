import {
  register,
  login,
  logout,
  getCurrentUserController,
  verifyEmail,
  forgotPassword,
  resetPassword,
  deleteUser,
} from '../auth.controller';
import * as authService from '../../services/auth.service';
import { Request, Response } from 'express';

jest.mock('../../services/auth.service');

const mockRes = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn().mockReturnValue(res);
  res.clearCookie = jest.fn().mockReturnValue(res);
  return res as Response;
};

describe('Auth Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register user and return result with status 201', async () => {
      (authService.registerUser as jest.Mock).mockResolvedValue({ user: { id: 'u1' }, token: 'jwt' });
      const req = { body: { email: 'a@b.com', password: 'pw', name: 'Test' } } as Request;
      const res = mockRes();

      await register(req, res, jest.fn());

      expect(authService.registerUser).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          user: { id: 'u1' },
          token: 'jwt',
        })
      );
    });
  });

  describe('login', () => {
    it('should login user, set cookie, and return result with status 200', async () => {
      (authService.loginUser as jest.Mock).mockResolvedValue({ user: { id: 'u1' }, token: 'jwt' });
      const req = { body: { email: 'a@b.com', password: 'pw' } } as Request;
      const res = mockRes();

      await login(req, res, jest.fn());

      expect(authService.loginUser).toHaveBeenCalledWith(req.body);
      expect(res.cookie).toHaveBeenCalledWith(
        'token',
        'jwt',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'strict',
          maxAge: expect.any(Number),
        })
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ user: { id: 'u1' }, token: 'jwt' });
    });
  });

  describe('logout', () => {
    it('should clear cookie and return logout message', async () => {
      (authService.logoutUser as jest.Mock).mockResolvedValue({ message: 'Logout successful' });
      const req = {} as Request;
      const res = mockRes();

      await logout(req, res, jest.fn());

      expect(res.clearCookie).toHaveBeenCalledWith(
        'token',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'strict',
        })
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Logout successful' });
    });
  });

  describe('getCurrentUserController', () => {
    it('should return 401 if userId is missing', async () => {
      const req = { user: undefined } as any;
      const res = mockRes();

      await getCurrentUserController(req, res, jest.fn());

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Not authenticated' });
    });

    it('should return user if userId is present', async () => {
      (authService.getCurrentUser as jest.Mock).mockResolvedValue({ user: { id: 'u1' } });
      const req = { user: { userId: 'u1' } } as any;
      const res = mockRes();

      await getCurrentUserController(req, res, jest.fn());

      expect(authService.getCurrentUser).toHaveBeenCalledWith('u1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ user: { id: 'u1' } });
    });
  });

  describe('verifyEmail', () => {
    it('should return 400 if token is missing', async () => {
      const req = { query: {} } as any;
      const res = mockRes();

      await verifyEmail(req, res, jest.fn());

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Verification token is required.' });
    });

    it('should verify email and return result', async () => {
      (authService.verifyUserEmail as jest.Mock).mockResolvedValue({ message: 'Email verified' });
      const req = { query: { token: 'abc' } } as any;
      const res = mockRes();

      await verifyEmail(req, res, jest.fn());

      expect(authService.verifyUserEmail).toHaveBeenCalledWith('abc');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Email verified' });
    });
  });

  describe('forgotPassword', () => {
    it('should return 400 if email is missing', async () => {
      const req = { body: {} } as any;
      const res = mockRes();

      await forgotPassword(req, res, jest.fn());

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Email is required' });
    });

    it('should call forgotPasswordService and return message', async () => {
      (authService.forgotPasswordService as jest.Mock).mockResolvedValue(undefined);
      const req = { body: { email: 'a@b.com' } } as any;
      const res = mockRes();

      await forgotPassword(req, res, jest.fn());

      expect(authService.forgotPasswordService).toHaveBeenCalledWith('a@b.com');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'If the email exists, a reset link will be sent' });
    });
  });

  describe('resetPassword', () => {
    it('should return 400 if token or newPassword is missing', async () => {
      const req = { body: {} } as any;
      const res = mockRes();

      await resetPassword(req, res, jest.fn());

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Token and new password are required' });
    });

    it('should call resetPasswordService and return result', async () => {
      (authService.resetPasswordService as jest.Mock).mockResolvedValue({ message: 'Password reset' });
      const req = { body: { token: 'abc', newPassword: 'pw' } } as any;
      const res = mockRes();

      await resetPassword(req, res, jest.fn());

      expect(authService.resetPasswordService).toHaveBeenCalledWith('abc', 'pw');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Password reset' });
    });
  });

  describe('deleteUser', () => {
    it('should return 401 if userId is missing', async () => {
      const req = { user: undefined } as any;
      const res = mockRes();

      await deleteUser(req, res, jest.fn());

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Not authenticated' });
    });

    it('should delete user, clear cookie, and return result', async () => {
      (authService.deleteUserService as jest.Mock).mockResolvedValue({ message: 'User deleted' });
      const req = { user: { userId: 'u1' } } as any;
      const res = mockRes();

      await deleteUser(req, res, jest.fn());

      expect(authService.deleteUserService).toHaveBeenCalledWith('u1');
      expect(res.clearCookie).toHaveBeenCalledWith(
        'token',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'strict',
        })
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'User deleted' });
    });
  });
});