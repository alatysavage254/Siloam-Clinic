const express = require('express');
const { body } = require('express-validator');
const {
  addDoctor,
  getDoctors,
  getDoctor,
  updateDoctor,
  deleteDoctor,
  getDoctorsBySpecialization,
  getDoctorAvailability,
  getDoctorStats
} = require('../controllers/doctorController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const doctorValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Doctor name must be between 2 and 100 characters'),
  body('specialization')
    .isIn(['Dental', 'Eye'])
    .withMessage('Specialization must be either Dental or Eye'),
  body('phone')
    .matches(/^[\+]?[0-9\s\-\(\)]{10,15}$/)
    .withMessage('Please provide a valid phone number'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('availableDays')
    .isArray({ min: 1 })
    .withMessage('At least one available day is required')
    .custom((days) => {
      const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      return days.every(day => validDays.includes(day));
    })
    .withMessage('Available days must be valid weekdays')
];

const updateDoctorValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Doctor name must be between 2 and 100 characters'),
  body('specialization')
    .optional()
    .isIn(['Dental', 'Eye'])
    .withMessage('Specialization must be either Dental or Eye'),
  body('phone')
    .optional()
    .matches(/^[\+]?[0-9\s\-\(\)]{10,15}$/)
    .withMessage('Please provide a valid phone number'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('availableDays')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one available day is required')
    .custom((days) => {
      if (!days) return true;
      const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      return days.every(day => validDays.includes(day));
    })
    .withMessage('Available days must be valid weekdays')
];

// All routes require authentication
router.use(protect);

// Routes
router.route('/')
  .post(authorize('admin'), doctorValidation, addDoctor)
  .get(getDoctors);

router.get('/stats', getDoctorStats);
router.get('/specialization/:type', getDoctorsBySpecialization);

router.route('/:id')
  .get(getDoctor)
  .put(authorize('admin'), updateDoctorValidation, updateDoctor)
  .delete(authorize('admin'), deleteDoctor);

router.get('/:id/availability', getDoctorAvailability);

module.exports = router;