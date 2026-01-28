const { body, param, validationResult } = require('express-validator');

// Validation result handler
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'Données invalides',
            details: errors.array().map(e => e.msg)
        });
    }
    next();
};

// Login validation
const loginValidation = [
    body('username')
        .trim()
        .notEmpty().withMessage('Le nom d\'utilisateur est requis')
        .escape(),
    body('password')
        .notEmpty().withMessage('Le mot de passe est requis'),
    handleValidationErrors
];

// User creation validation
const userCreationValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Le nom est requis')
        .isLength({ max: 100 }).withMessage('Le nom est trop long')
        .escape(),
    body('username')
        .trim()
        .notEmpty().withMessage('Le nom d\'utilisateur est requis')
        .isLength({ min: 3, max: 50 }).withMessage('Le nom d\'utilisateur doit avoir entre 3 et 50 caractères')
        .matches(/^[a-zA-Z0-9_]+$/).withMessage('Le nom d\'utilisateur ne peut contenir que des lettres, chiffres et underscores'),
    body('email')
        .optional({ nullable: true, checkFalsy: true })
        .isEmail().withMessage('Email invalide')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 6 }).withMessage('Le mot de passe doit avoir au moins 6 caractères'),
    body('role')
        .optional()
        .isIn(['agent', 'admin', 'super-admin']).withMessage('Rôle invalide'),
    body('region')
        .optional()
        .trim()
        .escape(),
    handleValidationErrors
];

// User update validation
const userUpdateValidation = [
    param('id')
        .isInt().withMessage('ID invalide'),
    body('name')
        .optional()
        .trim()
        .isLength({ max: 100 }).withMessage('Le nom est trop long')
        .escape(),
    body('email')
        .optional({ nullable: true, checkFalsy: true })
        .isEmail().withMessage('Email invalide')
        .normalizeEmail(),
    body('password')
        .optional({ nullable: true, checkFalsy: true })
        .isLength({ min: 6 }).withMessage('Le mot de passe doit avoir au moins 6 caractères'),
    body('username')
        .optional()
        .trim()
        .isLength({ min: 3, max: 50 }).withMessage('Le nom d\'utilisateur doit avoir entre 3 et 50 caractères')
        .matches(/^[a-zA-Z0-9_]+$/).withMessage('Le nom d\'utilisateur ne peut contenir que des lettres, chiffres et underscores'),
    body('phone')
        .optional()
        .trim()
        .escape(),
    body('department')
        .optional()
        .trim()
        .escape(),
    body('commune')
        .optional()
        .trim()
        .escape(),
    handleValidationErrors
];

// Case creation validation  
const caseValidation = [
    body('victimAge')
        .optional()
        .isInt({ min: 0, max: 150 }).withMessage('Âge invalide'),
    body('victimGender')
        .optional()
        .toLowerCase() // Sanitize to lowercase
        .isIn(['masculin', 'féminin', 'feminin', 'autre', 'femme', 'homme']).withMessage('Genre invalide'),
    body('violenceType')
        .optional()
        .trim()
        .escape(),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 5000 }).withMessage('Description trop longue'),
    handleValidationErrors
];

// ID parameter validation
const idParamValidation = [
    param('id')
        .isInt({ min: 1 }).withMessage('ID invalide'),
    handleValidationErrors
];

module.exports = {
    loginValidation,
    userCreationValidation,
    userUpdateValidation,
    caseValidation,
    idParamValidation,
    handleValidationErrors
};
