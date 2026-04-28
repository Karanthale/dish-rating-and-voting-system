import { body, param, validationResult } from 'express-validator';

export const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    next();
};

export const signupValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email format')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]/)
        .withMessage('Password must contain uppercase, lowercase, number, and special character'),
    body('role')
        .optional()
        .isIn(['student', 'admin', 'Student', 'Admin', 'Owner', 'owner']).withMessage('Invalid role')
];

export const loginValidation = [
    body('email').trim().isEmail().withMessage('Invalid email'),
    body('password').notEmpty().withMessage('Password is required')
];

export const ratingValidation = [
    body('mess_id').isInt({ min: 1 }).withMessage('Invalid mess ID'),
    body('rating_value').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1-5'),
    body('feedback').optional().trim().isLength({ max: 500 }).withMessage('Feedback too long')
];

export const messValidation = [
    body('name').trim().notEmpty().withMessage('Mess name required'),
    body('location').trim().notEmpty().withMessage('Location required'),
    body('description').optional().trim().isLength({ max: 1000 })
];