import Joi from 'joi';

export const createTaskSchema = Joi.object({
  title: Joi.string().min(1).required(),
});

export const updateTaskSchema = Joi.object({
  title: Joi.string().min(1).optional(),
  completed: Joi.boolean().optional(),
});