import Joi from 'joi';

export const shareTaskSchema = Joi.object({
  taskId: Joi.string().required(),
  targetUserId: Joi.string().required(),
});