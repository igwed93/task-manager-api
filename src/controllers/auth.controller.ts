import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthRequest } from '../middleware/auth.middleware';
import {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  verifyUserEmail,
  forgotPasswordService,
  resetPasswordService,
  deleteUserService,
} from '../services/auth.service';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await registerUser(req.body);
  res.status(201).json({
    message: 'User registered successfully. Please check your email to verify your account.',
    ...result,
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await loginUser(req.body);

  res.cookie('token', result.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json(result);
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  const result = await logoutUser();
  res.status(200).json(result);
});

export const getCurrentUserController = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({ message: 'Not authenticated' });
    return;
  }

  const result = await getCurrentUser(userId);
  res.status(200).json(result);
});

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.query;

  if (!token || typeof token !== 'string') {
    res.status(400).json({ message: 'Verification token is required.' });
    return;
  }

  const result = await verifyUserEmail(token);
  res.status(200).json(result);
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({ message: 'Email is required' });
    return;
  }

  await forgotPasswordService(email);
  res.status(200).json({ message: 'If the email exists, a reset link will be sent' });
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    res.status(400).json({ message: 'Token and new password are required' });
    return;
  }

  const result = await resetPasswordService(token, newPassword);
  res.status(200).json(result);
});

export const deleteUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    res.status(401).json({ message: 'Not authenticated' });
    return;
  }

  const result = await deleteUserService(userId);

  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  res.status(200).json(result);
});

export const getAdminDashboard = asyncHandler(async (req: AuthRequest, res: Response) => {
  // This is a placeholder for admin dashboard logic
  // You can implement your own logic here
  res.status(200).json({ message: 'Welcome to the admin dashboard' });
});