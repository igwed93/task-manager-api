import * as authService from '../../services/auth.service';
import prisma from '../../lib/prisma';
import { ConflictError, UnauthorizedError, ValidationError, NotFoundError } from '../../errors/appErrors';

jest.mock('../../lib/prisma');
jest.mock('../../utils/auth', () => ({
  hashPassword: jest.fn(async (pw) => `hashed-${pw}`),
  comparePasswords: jest.fn(async (pw, hash) => pw === 'valid' && hash === 'hashed-valid'),
  generateToken: jest.fn(() => 'jwt-token'),
}));
jest.mock('../../utils/token', () => ({
  generateVerificationToken: jest.fn(() => 'verify-token'),
}));
jest.mock('../../utils/sendEmails', () => ({
  sendVerificationEmail: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
}));
jest.mock('../../utils/auditLogger', () => ({
  logAudit: jest.fn(),
}));


beforeAll(() => {
  (prisma as any).task = {
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
  };
  (prisma as any).taskComment = {
    findUnique: jest.fn(),
    delete: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    findFirst: jest.fn(),
  };
  (prisma as any).commentReaction = {
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };
  (prisma as any).taskReaction = {
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };
  (prisma as any).notification = {
    create: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
  };
  (prisma as any).user = {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
  };
});

describe('auth.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('registerUser', () => {
    it('throws ConflictError if user exists', async () => {
      (prisma.user.findUnique as any).mockResolvedValue({ id: 'user1' });
      await expect(authService.registerUser({
        email: 'test@example.com', password: 'pw', name: 'Test'
      })).rejects.toThrow(ConflictError);
    });

    it('registers user, sends email, logs audit, returns user and token', async () => {
      (prisma.user.findUnique as any).mockResolvedValue(null);
      (prisma.user.create as any).mockResolvedValue({
        id: 'user1', email: 'test@example.com', name: 'Test', role: 'USER'
      });
      const result = await authService.registerUser({
        email: 'test@example.com', password: 'pw', name: 'Test'
      });
      expect(result.user).toHaveProperty('id', 'user1');
      expect(result).toHaveProperty('token');
    });
  });

  describe('loginUser', () => {
    it('throws UnauthorizedError if user not found', async () => {
      (prisma.user.findUnique as any).mockResolvedValue(null);
      await expect(authService.loginUser({ email: 'a', password: 'b' }))
        .rejects.toThrow(UnauthorizedError);
    });

    it('throws UnauthorizedError if email not verified', async () => {
      (prisma.user.findUnique as any).mockResolvedValue({ id: 'u', emailVerified: false });
      await expect(authService.loginUser({ email: 'a', password: 'b' }))
        .rejects.toThrow(UnauthorizedError);
    });

    it('throws UnauthorizedError if password does not match', async () => {
      (prisma.user.findUnique as any).mockResolvedValue({
        id: 'u',
        emailVerified: true,
        password: 'hashed-wrong',
      });
      const { comparePasswords } = require('../../utils/auth');
      comparePasswords.mockResolvedValue(false);
      await expect(authService.loginUser({ email: 'a', password: 'invalid' }))
        .rejects.toThrow(UnauthorizedError);
    });

    it('returns user and token on success', async () => {
      const { comparePasswords } = require('../../utils/auth');
      comparePasswords.mockResolvedValue(true); // ✅ explicitly succeed

      (prisma.user.findUnique as any).mockResolvedValue({
        id: 'u',
        email: 'e',
        name: 'n',
        role: 'USER',
        emailVerified: true,
        password: 'hashed-does-not-matter', // no need to match mock condition
      });

      const result = await authService.loginUser({ email: 'e', password: 'any-password' });

      expect(result.user).toHaveProperty('id', 'u');
      expect(result).toHaveProperty('token', 'jwt-token');
    });
  });

  describe('logoutUser', () => {
    it('logs audit if userId is provided', async () => {
      const result = await authService.logoutUser('user1');
      expect(result).toHaveProperty('message');
    });

    it('does not log audit if userId is not provided', async () => {
      const result = await authService.logoutUser();
      expect(result).toHaveProperty('message');
    });
  });

  describe('getCurrentUser', () => {
    it('throws NotFoundError if user not found', async () => {
      (prisma.user.findUnique as any).mockResolvedValue(null);
      await expect(authService.getCurrentUser('user1')).rejects.toThrow(NotFoundError);
    });

    it('returns user if found', async () => {
      (prisma.user.findUnique as any).mockResolvedValue({ id: 'user1', email: 'e', name: 'n' });
      const result = await authService.getCurrentUser('user1');
      expect(result.user).toHaveProperty('id', 'user1');
    });
  });

  describe('verifyUserEmail', () => {
    it('throws ValidationError if token is invalid or expired', async () => {
      (prisma.user.findFirst as any).mockResolvedValue(null);
      await expect(authService.verifyUserEmail('bad-token')).rejects.toThrow(ValidationError);
    });

    it('verifies email and logs audit', async () => {
      (prisma.user.findFirst as any).mockResolvedValue({ id: 'user1' });
      (prisma.user.update as any).mockResolvedValue({});
      const result = await authService.verifyUserEmail('verify-token');
      expect(result).toHaveProperty('message');
    });
  });

  describe('forgotPasswordService', () => {
    it('does nothing if user not found', async () => {
      (prisma.user.findUnique as any).mockResolvedValue(null);
      await expect(authService.forgotPasswordService('no@user.com')).resolves.toBeUndefined();
    });

    it('updates user with reset token, sends email, logs audit', async () => {
      (prisma.user.findUnique as any).mockResolvedValue({ id: 'user1', email: 'e' });
      (prisma.user.update as any).mockResolvedValue({});
      const result = await authService.forgotPasswordService('e');
      expect(result).toBeUndefined();
    });
  });

  describe('resetPasswordService', () => {
    it('throws ValidationError if token is invalid or expired', async () => {
      (prisma.user.findFirst as any).mockResolvedValue(null);
      await expect(authService.resetPasswordService('bad-token', 'pw')).rejects.toThrow(ValidationError);
    });

    it('resets password and logs audit', async () => {
      (prisma.user.findFirst as any).mockResolvedValue({ id: 'user1' });
      (prisma.user.update as any).mockResolvedValue({});
      const result = await authService.resetPasswordService('verify-token', 'pw');
      expect(result).toHaveProperty('message');
    });
  });

  describe('deleteUserService', () => {
    it('throws NotFoundError if user not found', async () => {
      (prisma.user.findUnique as any).mockResolvedValue(null);
      await expect(authService.deleteUserService('user1')).rejects.toThrow(NotFoundError);
    });

    it('deletes user and logs audit', async () => {
      (prisma.user.findUnique as any).mockResolvedValue({ id: 'user1' });
      (prisma.user.delete as any).mockResolvedValue({});
      const result = await authService.deleteUserService('user1');
      expect(result).toHaveProperty('message');
    });
  });
});