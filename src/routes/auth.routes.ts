import { Router } from 'express';
import prisma from '../lib/prisma';
import { requireAuth } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/authorize';
import {
  register,
  login,
  logout,
  getCurrentUser,
  forgotPassword,
  resetPassword
} from '../controllers/auth.controller';
import { getAdminDashboard } from '../controllers/admin.controller';

const router = Router();

// Register route
router.post('/register', requireAuth, register);

// Login route
router.post('/login', requireAuth, login);

// Logout route
router.post('logout', logout);


// Get current authenticated user
router.get(
  '/me',
  requireAuth,
  getCurrentUser
);

router.get('/admin-only', requireAuth, authorizeRoles('ADMIN'), getAdminDashboard);

router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);