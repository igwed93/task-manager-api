import Joi from 'joi';

export const addCommentSchema = Joi.object({
  content: Joi.string().min(1).required(),
});

export const updateCommentSchema = Joi.object({
  content: Joi.string().min(1).required(),
});