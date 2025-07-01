import { Router } from 'express';
import prisma from '../lib/prisma';
import { requireAuth } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/authorize';
import {
  register,
  login,
  logout,
  getCurrentUserController,
  forgotPassword,
  resetPassword,
  verifyEmail,
  deleteUser
} from '../controllers/auth.controller';
import { validateBody } from '../middleware/validation.middeware';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validations/user.validation';

const router = Router();

// Register route
router.post('/register', validateBody(registerSchema), register);

// Login route
router.post('/login', validateBody(loginSchema), login);

// Logout route
router.post('/logout', logout);

// verify email route
router.get('/verify-email', verifyEmail);


// Get current authenticated user
router.get(
  '/me',
  requireAuth,
  getCurrentUserController
);

router.post('/forgot-password', validateBody(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validateBody(resetPasswordSchema), resetPassword);
router.delete('/me', requireAuth, deleteUser);

export default router;