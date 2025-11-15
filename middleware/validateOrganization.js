// middleware/validateOrganization.js
import { body } from 'express-validator';

export const validateCreateOrganization = [
  body('name').isString().isLength({ max: 255 }).withMessage('Name is required and max 255 chars'),
  body('slug').isString().isLength({ max: 255 }).custom(async (value) => {
    const exists = await import('../models/organizationModel.js');
    const org = await exists.default.findOne({ slug: value });
    if (org) throw new Error('Slug already in use');
    return true;
  }),
  body('email').isEmail().isLength({ max: 255 }).custom(async (value) => {
    const exists = await import('../models/organizationModel.js');
    const org = await exists.default.findOne({ email: value });
    if (org) throw new Error('Email already in use');
    return true;
  }),
  body('type').isIn(['school', 'company', 'ngo']),
  body('address').optional().isString().isLength({ max: 255 }),
  body('password').isString().isLength({ min: 6 }).custom((value, { req }) => {
    if (value !== req.body.password_confirmation) {
      throw new Error('Password confirmation does not match');
    }
    return true;
  }),
];