import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import dotenv  from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error('Mssing JWT_SECRET in environment')
}

// Extend Express's Request tupe to include req.user
export interface AuthRequest extends Request {
    user?: { userId: string; role: string };
};

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const token = req.cookies.token;

    if (!token ) {
        res.status(401).json({ message: 'Unauthorized. No token found in cookies' });
        return;
    }

    try {
       const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

       if (!decoded || typeof decoded !== 'object' || !decoded.userId || !decoded.role) {
        res.status(401).json({ message: 'Invalid token structure.' });
        return;
       }

       req.user = { 
        userId: decoded.userId,
        role: decoded.role
        };
       next(); 
    } catch (error) {
        console.error('Authorization Middleware Error:', error);
        res.status(401).json({ message: 'Unauthorized. Invalid or expired token.' });
        return;
    }
};

