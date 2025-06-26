import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { hashPassword, comparePasswords, generateToken } from '../utils/auth';
import { AuthRequest } from '../middleware/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';
import { generateVerificationToken } from '../utils/token';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/sendEmails';

export const register = asyncHandler(async (req: Request, res: Response) => {
    const { email, password, name, role } = req.body;

    if (!email || !password || !name) {
        res.status(400).json({ message: 'All fields are required' });
        return;
    }

    const exisitingUser = await prisma.user.findUnique({ where: { email} });
    if (exisitingUser) {
        res.status(400).json({ message: 'User already exists' });
        return;
    }

    const hashed = await hashPassword(password);
    const verificationToken = generateVerificationToken();

    const user = await prisma.user.create({
        data: {
            email,
            password: hashed,
            name,
            role: role || 'USER',
            verificationToken,
            verificationTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
        },
    });

    // Send verification email
    await sendVerificationEmail(user.email, verificationToken);

    const token = generateToken(user.id, user.role);

    // set cookie
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
        message: 'User registered successfully. Please check your email to verify your account.',
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
        token,
    });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400).json({ message: 'Email and password are required' });
        return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        res.status(401).json({ message: 'Invalid credentials.' });
        return;
    }

    if (!user.emailVerified) {
        res.status(403).json({ message: 'Please verify your email before logging in.' });
        return;
    }

    const isMatch = await comparePasswords(password, user.password);
    if (!isMatch) {
        res.status(401).json({ message: 'Invalid credentials.' });
        return;
    }

    const token = generateToken(user.id, user.role);

    // set cookie
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        sameSite: 'strict', // Adjust as needed
        maxAge: 7 * 24 * 60 * 60 * 1000, // 1 day
    })

    res.status(200).json({
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
        token,
    });
    return;
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
    });

    res.status(200).json({ message: 'Logout successful' });
    return;
});

export const getCurrentUser = asyncHandler(async (req: AuthRequest, res) => {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true },
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json({ user });
  });

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
        res.status(400).json({ message: 'Verification token is required.' });
        return;
    }

    const user = await prisma.user.findFirst({
        where: {
            verificationToken: token,
            verificationTokenExpires: { gte: new Date() },
        },
    });

    if (!user) {
        res.status(400).json({ message: 'Invalid or expired verification token.' });
        return;
    }

    await prisma.user.update({
        where: { id: user.id },
        data: {
            emailVerified: true,
            verificationToken: null,
            verificationTokenExpires: null,
        },
    });

    res.status(200).json({ message: 'Email verified successfully.' });
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { email } = req.body;

        if (!email) {
            res.status(400).json({ message: 'Email is required' });
            return;
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            res.status(404).json({ message: 'If the email exists, a reset link will be sent ' });
            return;
        }

        const resetToken = generateVerificationToken(); // Generate a token for password reset

        await prisma.user.update({
            where: { id: user.id },
            data: {
                resetToken,
                resetTokenExpires: new Date(Date.now() + 60 * 60 * 1000), // Token valid for 1 hour
            },
        });

        await sendPasswordResetEmail(user.email, resetToken);
        res.status(200).json({ message: 'Password reset successful' });
    } catch (error) {
        console.error('Error in forgotPassword:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
 });

 export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            res.status(400).json({ message: 'Token and new password are required'});
            return;
        }

        const user = await prisma.user.findFirst({
            where: {
                resetToken: token,
                resetTokenExpires: { gte: new Date() },
            },
        });

        if (!user) {
            res.status(400).json({ message: 'Invalid or expired token' });
        }

        const hashed = await hashPassword(newPassword);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashed,
                resetToken: null,
                resetTokenExpires: null,
            },
        });

        res.status(200).json({ message: 'Password reset successful' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Something went wrong' });
    }
 });