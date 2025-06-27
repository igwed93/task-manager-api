import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // TLS, not SSL
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendVerificationEmail = async (to: string, token: string) => {
    const verificationUrl = `http://localhost:5000/api/auth/verify-email?token=${token}`;

    try {
        const data = await transporter.sendMail({
            from: `"Task Manager" <${process.env.EMAIL_USER}>`,
            to,
            subject: 'Please verify your Task Manager account',
            html: `<p>Hello,</p><p>Please click the link below to verify your Task Manager Account:</p>
                   <a href="${verificationUrl}">${verificationUrl}</a><p>This link expires in 24 hours.</p>`,
        });

        console.log('Verification email sent:', data.messageId);
    } catch (error) {
        console.error('Error sending verification email:', error);
        throw new Error('Failed to send verification email');
    }
};

export const sendPasswordResetEmail = async (to: string, token: string) => {
    const resetUrl = `http://localhost:5000/api/auth/reset-password?token=${token}`;

    try {
        const data = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject: 'Reset your password',
            html: `<p>Click the link below to reset your password:</p>
                   <a href="${resetUrl}">${resetUrl}</a>
                   <p>This link expires in 1 hour.</p>`,
        });

        console.log('Password reset email sent:', data.messageId);
    } catch (error) {
        console.error('Error sending password reset email:', error);
        throw new Error('Failed to send password reset email');
    }
};