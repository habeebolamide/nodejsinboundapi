import { body } from 'express-validator';

export const validateCreateSession = [
  body('group').isMongoId().withMessage('Group ID is required and must be a valid MongoDB ID'),
  body('supervisor').isMongoId().withMessage('Supervisor ID is required and must be a valid MongoDB ID'),
  body('title').optional().isString().isLength({ max: 255 }).withMessage('Title must be a string and less than 255 characters'),
  body('latitude').isFloat({ min: -90, max: 90 }).withMessage('Latitude must be a number between -90 and 90'),
  body('longitude').isFloat({ min: -180, max: 180 }).withMessage('Longitude must be a number between -180 and 180'),
  body('radius').optional().isInt({ min: 10, max: 500 }).withMessage('Radius must be an integer between 10 and 500'),
  body('start_time').isISO8601().withMessage('Start time must be a valid date').custom(value => new Date(value) > new Date()).withMessage('Start time must be after now'),
  body('end_time').isISO8601().withMessage('End time must be a valid date').custom((value, { req }) => new Date(value) > new Date(req.body.start_time)).withMessage('End time must be after start time')
];