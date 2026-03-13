const express = require('express');
const {
  getDashboardStats,
  getRevenueAnalytics,
  getAppointmentAnalytics
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Routes
router.get('/stats', getDashboardStats);
router.get('/revenue', getRevenueAnalytics);
router.get('/appointments', getAppointmentAnalytics);

module.exports = router;