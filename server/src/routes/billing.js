const express = require('express');
const { body } = require('express-validator');
const {
  createBilling,
  getBillingRecords,
  getBillingRecord,
  updateBillingRecord,
  markAsPaid,
  downloadInvoice,
  getBillingStats,
  deleteBillingRecord
} = require('../controllers/billingController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const billingValidation = [
  body('patientId')
    .isMongoId()
    .withMessage('Please provide a valid patient ID'),
  body('doctorId')
    .isMongoId()
    .withMessage('Please provide a valid doctor ID'),
  body('appointmentId')
    .isMongoId()
    .withMessage('Please provide a valid appointment ID'),
  body('services')
    .isArray({ min: 1 })
    .withMessage('At least one service is required'),
  body('services.*.name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Service name must be between 2 and 100 characters'),
  body('services.*.cost')
    .isNumeric({ min: 0 })
    .withMessage('Service cost must be a positive number')
];

const updateBillingValidation = [
  body('services')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one service is required'),
  body('services.*.name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Service name must be between 2 and 100 characters'),
  body('services.*.cost')
    .optional()
    .isNumeric({ min: 0 })
    .withMessage('Service cost must be a positive number'),
  body('paymentStatus')
    .optional()
    .isIn(['pending', 'paid', 'overdue'])
    .withMessage('Payment status must be pending, paid, or overdue')
];

const paymentValidation = [
  body('paymentMethod')
    .isIn(['cash', 'card', 'mobile_money', 'bank_transfer'])
    .withMessage('Payment method must be cash, card, mobile_money, or bank_transfer')
];

// All routes require authentication
router.use(protect);

// Routes
router.route('/')
  .post(billingValidation, createBilling)
  .get(getBillingRecords);

router.get('/stats', getBillingStats);

router.route('/:id')
  .get(getBillingRecord)
  .put(updateBillingValidation, updateBillingRecord)
  .delete(authorize('admin'), deleteBillingRecord);

router.put('/:id/pay', paymentValidation, markAsPaid);
router.get('/:id/invoice', downloadInvoice);

module.exports = router;