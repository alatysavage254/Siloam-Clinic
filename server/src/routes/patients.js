const express = require('express');
const { body } = require('express-validator');
const {
  registerPatient,
  getPatients,
  getPatient,
  updatePatient,
  deletePatient,
  getPatientStats
} = require('../controllers/patientController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const patientValidation = [
  body('fullName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  body('phone')
    .matches(/^[\+]?[0-9\s\-\(\)]{10,15}$/)
    .withMessage('Please provide a valid phone number'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('dateOfBirth')
    .isISO8601()
    .toDate()
    .withMessage('Please provide a valid date of birth'),
  body('gender')
    .isIn(['Male', 'Female', 'Other'])
    .withMessage('Gender must be Male, Female, or Other'),
  body('address')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Address must be between 5 and 200 characters'),
  body('nationalId')
    .trim()
    .isLength({ min: 5, max: 20 })
    .withMessage('National ID must be between 5 and 20 characters'),
  body('medicalNotes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Medical notes cannot exceed 1000 characters')
];

const updatePatientValidation = [
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  body('phone')
    .optional()
    .matches(/^[\+]?[0-9\s\-\(\)]{10,15}$/)
    .withMessage('Please provide a valid phone number'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Please provide a valid date of birth'),
  body('gender')
    .optional()
    .isIn(['Male', 'Female', 'Other'])
    .withMessage('Gender must be Male, Female, or Other'),
  body('address')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Address must be between 5 and 200 characters'),
  body('nationalId')
    .optional()
    .trim()
    .isLength({ min: 5, max: 20 })
    .withMessage('National ID must be between 5 and 20 characters'),
  body('medicalNotes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Medical notes cannot exceed 1000 characters')
];

// All routes require authentication
router.use(protect);

// Routes
router.route('/')
  .post(patientValidation, registerPatient)
  .get(getPatients);

router.get('/stats', getPatientStats);

router.route('/:id')
  .get(getPatient)
  .put(updatePatientValidation, updatePatient)
  .delete(authorize('admin'), deletePatient);

module.exports = router;