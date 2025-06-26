import { Request, Response } from 'express';

export const getAdminDashboard = async (req: Request, res: Response) => {
  res.status(200).json({ message: 'Welcome to the admin dashboard!' });
  return;
};