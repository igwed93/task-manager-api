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
import { getAdminDashboard } from '../controllers/admin.controller';

const router = Router();

// Register route
router.post('/register', register);

// Login route
router.post('/login', requireAuth, login);

// Logout route
router.post('logout', logout);

// verify email route
router.get('/verify-email', verifyEmail);


// Get current authenticated user
router.get(
  '/me',
  requireAuth,
  getCurrentUserController
);

router.get('/admin-only', requireAuth, authorizeRoles('ADMIN'), getAdminDashboard);

router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.delete('/me', requireAuth, deleteUser);

export default router;