import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

export const hashPassword = async (password: string) => {
    return await bcrypt.hash(password, 10);
};

export const comparePasswords = async (plainText: string, hashed: string) => {
    return await bcrypt.compare(plainText, hashed);
};

export const generateToken = (userId: string, role: any) => {
    return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '7d' });
};