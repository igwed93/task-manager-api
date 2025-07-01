import Joi from 'joi';

export const reactionSchema = Joi.object({
  reactionType: Joi.string().min(1).required(),
});