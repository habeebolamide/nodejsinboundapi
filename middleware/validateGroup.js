// middleware/validateGroup.js
import { body } from 'express-validator';

export const validateCreateGroup = [
  body('name').isString().isLength({ max: 255 }).withMessage('Name required'),
];