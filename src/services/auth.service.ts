import prisma from '../lib/prisma';
import { hashPassword, comparePasswords, generateToken } from '../utils/auth';
import { generateVerificationToken } from '../utils/token';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/sendEmails';
import { Role } from '../generated/prisma'; // or '@prisma/client' if using default output
import {
  NotFoundError,
  ValidationError,
  UnauthorizedError,
  ConflictError,
} from '../errors/appErrors';
import { logAudit } from '../utils/auditLogger';

export async function registerUser({ email, password, name, role }: { email: string, password: string, name: string, role?: string }) {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) throw new ConflictError('User already exists');

    const hashed = await hashPassword(password);
    const verificationToken = generateVerificationToken();

    const user = await prisma.user.create({
        data: {
            email,
            password: hashed,
            name,
            role: (role as Role) || Role.USER,
            verificationToken,
            verificationTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
    });

    await sendVerificationEmail(user.email, verificationToken);

    await logAudit({
      userId: user.id,
      action: 'REGISTER',
      entity: 'User',
      entityId: user.id,
      details: 'User registered',
    });

    const token = generateToken(user.id, user.role);
    return {
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
        token,
    };
}

export async function loginUser({ email, password }: { email: string, password: string }) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedError('Invalid credentials');
    if (!user.emailVerified) throw new UnauthorizedError('Please verify your email before logging in.');

    const isMatch = await comparePasswords(password, user.password);
    if (!isMatch) throw new UnauthorizedError('Invalid credentials');

    await logAudit({
      userId: user.id,
      action: 'LOGIN',
      entity: 'User',
      entityId: user.id,
      details: 'User logged in',
    });

    const token = generateToken(user.id, user.role);
    return {
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
        token,
    };
}

export async function logoutUser(userId?: string) {
    if (userId) {
      await logAudit({
        userId,
        action: 'LOGOUT',
        entity: 'User',
        entityId: userId,
        details: 'User logged out',
      });
    }
    return { message: 'Logout successful' };
}

export async function getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, name: true },
    });
    if (!user) throw new NotFoundError('User not found');
    return { user };
}

export async function verifyUserEmail(token: string) {
    const user = await prisma.user.findFirst({
        where: {
            verificationToken: token,
            verificationTokenExpires: { gte: new Date() },
        },
    });
    if (!user) throw new ValidationError('Invalid or expired verification token.');

    await prisma.user.update({
        where: { id: user.id },
        data: {
            emailVerified: true,
            verificationToken: null,
            verificationTokenExpires: null,
        },
    });

    await logAudit({
      userId: user.id,
      action: 'EMAIL_VERIFIED',
      entity: 'User',
      entityId: user.id,
      details: 'User verified email address',
    });

    return { message: 'Email verified successfully.' };
}

export async function forgotPasswordService(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return; // Don't reveal if user exists

    const resetToken = generateVerificationToken();
    await prisma.user.update({
        where: { id: user.id },
        data: {
            resetToken,
            resetTokenExpires: new Date(Date.now() + 60 * 60 * 1000),
        },
    });

    await sendPasswordResetEmail(user.email, resetToken);

    await logAudit({
      userId: user.id,
      action: 'PASSWORD_RESET_REQUEST',
      entity: 'User',
      entityId: user.id,
      details: `Password reset requested for email: ${email}`,
    });
}

export async function resetPasswordService(token: string, newPassword: string) {
    const user = await prisma.user.findFirst({
        where: {
            resetToken: token,
            resetTokenExpires: { gte: new Date() },
        },
    });
    if (!user) throw new ValidationError('Invalid or expired token');

    const hashed = await hashPassword(newPassword);

    await prisma.user.update({
        where: { id: user.id },
        data: {
            password: hashed,
            resetToken: null,
            resetTokenExpires: null,
        },
    });

    await logAudit({
      userId: user.id,
      action: 'PASSWORD_RESET',
      entity: 'User',
      entityId: user.id,
      details: 'User reset password',
    });

    return { message: 'Password reset successful' };
}

export async function deleteUserService(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError('User not found');
    await prisma.user.delete({ where: { id: userId } });

    await logAudit({
      userId,
      action: 'DELETE',
      entity: 'User',
      entityId: userId,
      details: 'User account deleted',
    });

    return { message: 'User account deleted successfully.' };
}