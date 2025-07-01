import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import {
  getAllUsersService,
  deleteAnyTaskService,
  deleteAnyCommentService,
} from '../services/admin.service';

export const getAllUsers = asyncHandler(async (_req, res) => {
  const users = await getAllUsersService();
  res.status(200).json(users);
});

export const deleteAnyTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const result = await deleteAnyTaskService(taskId);
  res.status(200).json(result);
});

export const deleteAnyComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const result = await deleteAnyCommentService(commentId);
  res.status(200).json(result);
});