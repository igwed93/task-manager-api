import { getAllUsers, deleteAnyTask, deleteAnyComment } from '../admin.controller';
import * as adminService from '../../services/admin.service';
import { Request, Response, NextFunction } from 'express';

jest.mock('../../services/admin.service');

const mockRes = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

const mockNext: NextFunction = jest.fn();

describe('Admin Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllUsers', () => {
    it('should return all users with status 200', async () => {
      const users = [{ id: 'u1', name: 'User1' }];
      (adminService.getAllUsersService as jest.Mock).mockResolvedValue(users);

      const req = {} as Request;
      const res = mockRes();

      await getAllUsers(req, res, mockNext);

      expect(adminService.getAllUsersService).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(users);
    });
  });

  describe('deleteAnyTask', () => {
    it('should delete a task and return result with status 200', async () => {
      const result = { message: 'Task deleted by admin' };
      (adminService.deleteAnyTaskService as jest.Mock).mockResolvedValue(result);

      const req = { params: { taskId: 't1' } } as unknown as Request;
      const res = mockRes();

      await deleteAnyTask(req, res, mockNext);

      expect(adminService.deleteAnyTaskService).toHaveBeenCalledWith('t1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(result);
    });
  });

  describe('deleteAnyComment', () => {
    it('should delete a comment and return result with status 200', async () => {
      const result = { message: 'Comment deleted by admin' };
      (adminService.deleteAnyCommentService as jest.Mock).mockResolvedValue(result);

      const req = { params: { commentId: 'c1' } } as unknown as Request;
      const res = mockRes();

      await deleteAnyComment(req, res, mockNext);

      expect(adminService.deleteAnyCommentService).toHaveBeenCalledWith('c1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(result);
    });
  });
});