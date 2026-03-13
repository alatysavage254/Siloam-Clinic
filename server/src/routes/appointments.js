const express = require('express');
const { body } = require('express-validator');
const {
  bookAppointment,
  getAppointments,
  getAppointment,
  updateAppointmentStatus,
  updateAppointment,
  deleteAppointment,
  getUpcomingAppointments,
  getAppointmentStats
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const appointmentValidation = [
  body('patientId')
    .isMongoId()
    .withMessage('Please provide a valid patient ID'),
  body('doctorId')
    .isMongoId()
    .withMessage('Please provide a valid doctor ID'),
  body('date')
    .isISO8601()
    .toDate()
    .withMessage('Please provide a valid appointment date'),
  body('time')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Please provide time in HH:MM format'),
  body('reason')
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Reason must be between 5 and 500 characters')
];

const updateAppointmentValidation = [
  body('patientId')
    .optional()
    .isMongoId()
    .withMessage('Please provide a valid patient ID'),
  body('doctorId')
    .optional()
    .isMongoId()
    .withMessage('Please provide a valid doctor ID'),
  body('date')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Please provide a valid appointment date'),
  body('time')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Please provide time in HH:MM format'),
  body('reason')
    .optional()
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Reason must be between 5 and 500 characters'),
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters')
];

const statusValidation = [
  body('status')
    .isIn(['pending', 'approved', 'rejected'])
    .withMessage('Status must be pending, approved, or rejected')
];

// All routes require authentication
router.use(protect);

// Routes
router.route('/')
  .post(appointmentValidation, bookAppointment)
  .get(getAppointments);

router.get('/stats', getAppointmentStats);
router.get('/upcoming', getUpcomingAppointments);

router.route('/:id')
  .get(getAppointment)
  .put(updateAppointmentValidation, updateAppointment)
  .delete(authorize('admin'), deleteAppointment);

router.put('/:id/status', statusValidation, updateAppointmentStatus);

module.exports = router;