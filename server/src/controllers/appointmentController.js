const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const { validationResult } = require('express-validator');
const smsService = require('../services/smsService');

// @desc    Book new appointment
// @route   POST /api/appointments
// @access  Private
const bookAppointment = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { patientId, doctorId, date, time, reason } = req.body;

    // Verify patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Verify doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Check if doctor is available on the requested day
    const appointmentDay = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
    if (!doctor.availableDays.includes(appointmentDay)) {
      return res.status(400).json({
        success: false,
        message: `Dr. ${doctor.name} is not available on ${appointmentDay}`
      });
    }

    // Check for existing appointment at the same time
    const existingAppointment = await Appointment.findOne({
      doctorId,
      date: new Date(date),
      time,
      status: { $ne: 'rejected' }
    });

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: 'Doctor is not available at this time slot'
      });
    }

    // Create appointment
    const appointment = await Appointment.create({
      patientId,
      doctorId,
      date,
      time,
      reason
    });

    // Populate the appointment with patient and doctor details
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('patientId', 'fullName phone email')
      .populate('doctorId', 'name specialization');

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      data: populatedAppointment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all appointments
// @route   GET /api/appointments
// @access  Private
const getAppointments = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const doctorId = req.query.doctorId;
    const patientId = req.query.patientId;
    const date = req.query.date;

    // Build query
    let query = {};
    
    if (status) {
      query.status = status;
    }

    if (doctorId) {
      query.doctorId = doctorId;
    }

    if (patientId) {
      query.patientId = patientId;
    }

    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      
      query.date = {
        $gte: startDate,
        $lt: endDate
      };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get appointments with pagination and population
    const appointments = await Appointment.find(query)
      .populate('patientId', 'fullName phone email')
      .populate('doctorId', 'name specialization')
      .sort({ date: 1, time: 1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Appointment.countDocuments(query);

    res.status(200).json({
      success: true,
      count: appointments.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: appointments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single appointment
// @route   GET /api/appointments/:id
// @access  Private
const getAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patientId', 'fullName phone email dateOfBirth gender')
      .populate('doctorId', 'name specialization phone email');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update appointment status
// @route   PUT /api/appointments/:id/status
// @access  Private
const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be pending, approved, or rejected'
      });
    }

    const appointment = await Appointment.findById(req.params.id)
      .populate('patientId', 'fullName phone')
      .populate('doctorId', 'name');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Update appointment status
    appointment.status = status;
    await appointment.save();

    // Send SMS notification if appointment is approved
    if (status === 'approved') {
      try {
        await smsService.sendAppointmentConfirmation(appointment);
      } catch (smsError) {
        console.error('SMS sending failed:', smsError);
        // Don't fail the request if SMS fails
      }
    }

    res.status(200).json({
      success: true,
      message: `Appointment ${status} successfully`,
      data: appointment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update appointment details
// @route   PUT /api/appointments/:id
// @access  Private
const updateAppointment = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    let appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // If date, time, or doctor is being changed, validate availability
    if (req.body.date || req.body.time || req.body.doctorId) {
      const doctorId = req.body.doctorId || appointment.doctorId;
      const date = req.body.date || appointment.date;
      const time = req.body.time || appointment.time;

      // Check for conflicts (excluding current appointment)
      const existingAppointment = await Appointment.findOne({
        _id: { $ne: req.params.id },
        doctorId,
        date: new Date(date),
        time,
        status: { $ne: 'rejected' }
      });

      if (existingAppointment) {
        return res.status(400).json({
          success: false,
          message: 'Doctor is not available at this time slot'
        });
      }

      // Validate doctor availability for the day
      if (req.body.doctorId || req.body.date) {
        const doctor = await Doctor.findById(doctorId);
        const appointmentDay = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
        
        if (!doctor.availableDays.includes(appointmentDay)) {
          return res.status(400).json({
            success: false,
            message: `Doctor is not available on ${appointmentDay}`
          });
        }
      }
    }

    appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('patientId', 'fullName phone email')
     .populate('doctorId', 'name specialization');

    res.status(200).json({
      success: true,
      message: 'Appointment updated successfully',
      data: appointment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete appointment
// @route   DELETE /api/appointments/:id
// @access  Private
const deleteAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    await Appointment.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Appointment deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get upcoming appointments
// @route   GET /api/appointments/upcoming
// @access  Private
const getUpcomingAppointments = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const appointments = await Appointment.find({
      date: { $gte: today },
      status: 'approved'
    })
    .populate('patientId', 'fullName phone')
    .populate('doctorId', 'name specialization')
    .sort({ date: 1, time: 1 })
    .limit(10);

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get appointment statistics
// @route   GET /api/appointments/stats
// @access  Private
const getAppointmentStats = async (req, res, next) => {
  try {
    const stats = await Appointment.aggregate([
      {
        $group: {
          _id: null,
          totalAppointments: { $sum: 1 },
          pendingAppointments: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          approvedAppointments: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
          },
          rejectedAppointments: {
            $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
          }
        }
      }
    ]);

    const result = stats[0] || {
      totalAppointments: 0,
      pendingAppointments: 0,
      approvedAppointments: 0,
      rejectedAppointments: 0
    };

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  bookAppointment,
  getAppointments,
  getAppointment,
  updateAppointmentStatus,
  updateAppointment,
  deleteAppointment,
  getUpcomingAppointments,
  getAppointmentStats
};