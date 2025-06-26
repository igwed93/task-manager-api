import { Resend } from 'resend';
import dotenv from 'dotenv';
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerificationEmail = async (to: string, token: string) => {
    const verificationUrl = `http://localhost:5000/api/auth/verify-email?token=${token}`;

    try {
        const data = await resend.emails.send({
            from: process.env.EMAIL_FROM!,
            to,
            subject: 'Verify your email address',
            html: `<p>Hello,</p><p>Please click the link below to verify your email address:</p>
                   <a href="${verificationUrl}">${verificationUrl}</a><p>This link expires in 24 hours.</p>`,
        });

        console.log('Verification email sent:', data);
    } catch (error) {
        console.error('Error sending verification email:', error);
        throw new Error('Failed to send verification email');
    }
};

export const sendPasswordResetEmail = async (to: string, token: string) => {
    const resetUrl = `http://localhost:5000/api/auth/reset-password?token=${token}`;

    try {
        const data = await resend.emails.send({
            from: process.env.EMAIL_FROM!,
            to,
            subject: 'Reset your password',
            html: `<p>Click the link below to reset your password:</p>
                   <a href="${resetUrl}">${resetUrl}</a>
                   <p>This link expires in 1 hour.</p>`,
        });

        console.log('Password reset email sent:', data);
    } catch (error) {
        console.error('Error sending password reset email:', error);
        throw new Error('Failed to send password reset email');
    }
};