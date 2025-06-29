import { Request, Response, NextFunction } from 'express';
import { HttpError } from '../errors/appErrors';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
  if (err instanceof HttpError) {
    res.status(err.statusCode).json({ message: err.message });
    return;
  }
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Something went wrong' });
};