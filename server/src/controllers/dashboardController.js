const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const Billing = require('../models/Billing');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res, next) => {
  try {
    // Get basic counts
    const [
      totalPatients,
      totalDoctors,
      totalAppointments,
      pendingAppointments,
      revenueStats
    ] = await Promise.all([
      Patient.countDocuments(),
      Doctor.countDocuments(),
      Appointment.countDocuments(),
      Appointment.countDocuments({ status: 'pending' }),
      Billing.getRevenueStats()
    ]);

    // Get today's appointments
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayAppointments = await Appointment.countDocuments({
      date: { $gte: today, $lt: tomorrow },
      status: 'approved'
    });

    // Get recent appointments (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const recentAppointments = await Appointment.find({
      createdAt: { $gte: weekAgo }
    })
    .populate('patientId', 'fullName')
    .populate('doctorId', 'name specialization')
    .sort({ createdAt: -1 })
    .limit(5);

    // Get monthly revenue trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRevenue = await Billing.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
          paymentStatus: 'paid'
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$totalAmount' },
          invoices: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Get appointment status distribution
    const appointmentStatusStats = await Appointment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get doctor specialization distribution
    const specializationStats = await Doctor.aggregate([
      {
        $group: {
          _id: '$specialization',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get top services by revenue
    const topServices = await Billing.aggregate([
      { $unwind: '$services' },
      {
        $group: {
          _id: '$services.name',
          totalRevenue: { $sum: '$services.cost' },
          count: { $sum: 1 }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 5 }
    ]);

    // Get patient demographics
    const patientDemographics = await Patient.aggregate([
      {
        $group: {
          _id: '$gender',
          count: { $sum: 1 }
        }
      }
    ]);

    // Calculate growth rates (compared to previous month)
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    lastMonth.setDate(1);
    lastMonth.setHours(0, 0, 0, 0);

    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const [
      lastMonthPatients,
      thisMonthPatients,
      lastMonthAppointments,
      thisMonthAppointments,
      lastMonthRevenue,
      thisMonthRevenue
    ] = await Promise.all([
      Patient.countDocuments({ createdAt: { $gte: lastMonth, $lt: thisMonth } }),
      Patient.countDocuments({ createdAt: { $gte: thisMonth } }),
      Appointment.countDocuments({ createdAt: { $gte: lastMonth, $lt: thisMonth } }),
      Appointment.countDocuments({ createdAt: { $gte: thisMonth } }),
      Billing.aggregate([
        {
          $match: {
            createdAt: { $gte: lastMonth, $lt: thisMonth },
            paymentStatus: 'paid'
          }
        },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Billing.aggregate([
        {
          $match: {
            createdAt: { $gte: thisMonth },
            paymentStatus: 'paid'
          }
        },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ])
    ]);

    // Calculate growth percentages
    const patientGrowth = lastMonthPatients > 0 
      ? ((thisMonthPatients - lastMonthPatients) / lastMonthPatients * 100).toFixed(1)
      : 0;

    const appointmentGrowth = lastMonthAppointments > 0
      ? ((thisMonthAppointments - lastMonthAppointments) / lastMonthAppointments * 100).toFixed(1)
      : 0;

    const lastMonthRevenueTotal = lastMonthRevenue[0]?.total || 0;
    const thisMonthRevenueTotal = thisMonthRevenue[0]?.total || 0;
    const revenueGrowth = lastMonthRevenueTotal > 0
      ? ((thisMonthRevenueTotal - lastMonthRevenueTotal) / lastMonthRevenueTotal * 100).toFixed(1)
      : 0;

    const dashboardData = {
      overview: {
        totalPatients,
        totalDoctors,
        totalAppointments,
        pendingAppointments,
        todayAppointments,
        totalRevenue: revenueStats.totalRevenue,
        paidRevenue: revenueStats.paidRevenue,
        pendingRevenue: revenueStats.pendingRevenue
      },
      growth: {
        patientGrowth: parseFloat(patientGrowth),
        appointmentGrowth: parseFloat(appointmentGrowth),
        revenueGrowth: parseFloat(revenueGrowth)
      },
      charts: {
        monthlyRevenue: monthlyRevenue.map(item => ({
          month: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
          revenue: item.revenue,
          invoices: item.invoices
        })),
        appointmentStatus: appointmentStatusStats.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        specializations: specializationStats.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        patientDemographics: patientDemographics.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      },
      topServices,
      recentAppointments: recentAppointments.map(apt => ({
        id: apt._id,
        patient: apt.patientId?.fullName,
        doctor: apt.doctorId?.name,
        specialization: apt.doctorId?.specialization,
        date: apt.date,
        time: apt.time,
        status: apt.status,
        createdAt: apt.createdAt
      }))
    };

    res.status(200).json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get revenue analytics
// @route   GET /api/dashboard/revenue
// @access  Private
const getRevenueAnalytics = async (req, res, next) => {
  try {
    const { period = 'month', year, month } = req.query;

    let matchStage = { paymentStatus: 'paid' };
    let groupStage = {};

    // Build date filter based on period
    if (year) {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(parseInt(year) + 1, 0, 1);
      matchStage.createdAt = { $gte: startDate, $lt: endDate };
    }

    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 1);
      matchStage.createdAt = { $gte: startDate, $lt: endDate };
    }

    // Define grouping based on period
    switch (period) {
      case 'day':
        groupStage = {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          }
        };
        break;
      case 'week':
        groupStage = {
          _id: {
            year: { $year: '$createdAt' },
            week: { $week: '$createdAt' }
          }
        };
        break;
      case 'year':
        groupStage = {
          _id: {
            year: { $year: '$createdAt' }
          }
        };
        break;
      default: // month
        groupStage = {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          }
        };
    }

    const revenueData = await Billing.aggregate([
      { $match: matchStage },
      {
        $group: {
          ...groupStage,
          revenue: { $sum: '$totalAmount' },
          invoices: { $sum: 1 },
          avgInvoiceValue: { $avg: '$totalAmount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.week': 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: revenueData
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get appointment analytics
// @route   GET /api/dashboard/appointments
// @access  Private
const getAppointmentAnalytics = async (req, res, next) => {
  try {
    const { period = 'week' } = req.query;

    // Get appointment trends
    const now = new Date();
    let startDate;

    switch (period) {
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear() - 2, 0, 1);
        break;
      default: // week
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days
    }

    const appointmentTrends = await Appointment.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          total: { $sum: 1 },
          approved: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
          },
          pending: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          rejected: {
            $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Get peak hours
    const peakHours = await Appointment.aggregate([
      {
        $match: {
          status: 'approved',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { $substr: ['$time', 0, 2] },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        trends: appointmentTrends,
        peakHours
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getRevenueAnalytics,
  getAppointmentAnalytics
};