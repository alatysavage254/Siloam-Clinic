const Doctor = require('../models/Doctor');
const { validationResult } = require('express-validator');

// @desc    Add new doctor
// @route   POST /api/doctors
// @access  Private (Admin only)
const addDoctor = async (req, res, next) => {
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

    const { name, specialization, phone, email, availableDays } = req.body;

    // Check if doctor already exists
    const existingDoctor = await Doctor.findOne({ email });

    if (existingDoctor) {
      return res.status(400).json({
        success: false,
        message: 'Doctor with this email already exists'
      });
    }

    // Create doctor
    const doctor = await Doctor.create({
      name,
      specialization,
      phone,
      email,
      availableDays
    });

    res.status(201).json({
      success: true,
      message: 'Doctor added successfully',
      data: doctor
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all doctors
// @route   GET /api/doctors
// @access  Private
const getDoctors = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const specialization = req.query.specialization;
    const availableToday = req.query.availableToday;

    // Build query
    let query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (specialization) {
      query.specialization = specialization;
    }

    if (availableToday === 'true') {
      const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
      query.availableDays = { $in: [today] };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get doctors with pagination
    const doctors = await Doctor.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Doctor.countDocuments(query);

    res.status(200).json({
      success: true,
      count: doctors.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: doctors
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single doctor
// @route   GET /api/doctors/:id
// @access  Private
const getDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    res.status(200).json({
      success: true,
      data: doctor
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update doctor
// @route   PUT /api/doctors/:id
// @access  Private (Admin only)
const updateDoctor = async (req, res, next) => {
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

    let doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Check if email is being changed and already exists
    if (req.body.email && req.body.email !== doctor.email) {
      const existingEmail = await Doctor.findOne({ email: req.body.email });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }
    }

    doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      message: 'Doctor updated successfully',
      data: doctor
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete doctor
// @route   DELETE /api/doctors/:id
// @access  Private (Admin only)
const deleteDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    await Doctor.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Doctor deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get doctors by specialization
// @route   GET /api/doctors/specialization/:type
// @access  Private
const getDoctorsBySpecialization = async (req, res, next) => {
  try {
    const { type } = req.params;
    
    if (!['Dental', 'Eye'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid specialization. Must be Dental or Eye'
      });
    }

    const doctors = await Doctor.find({ specialization: type })
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get doctor availability
// @route   GET /api/doctors/:id/availability
// @access  Private
const getDoctorAvailability = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const isAvailableToday = doctor.availableDays.includes(today);

    res.status(200).json({
      success: true,
      data: {
        doctorId: doctor._id,
        name: doctor.name,
        specialization: doctor.specialization,
        availableDays: doctor.availableDays,
        isAvailableToday,
        today
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get doctor statistics
// @route   GET /api/doctors/stats
// @access  Private
const getDoctorStats = async (req, res, next) => {
  try {
    const stats = await Doctor.aggregate([
      {
        $group: {
          _id: null,
          totalDoctors: { $sum: 1 },
          dentalDoctors: {
            $sum: { $cond: [{ $eq: ['$specialization', 'Dental'] }, 1, 0] }
          },
          eyeDoctors: {
            $sum: { $cond: [{ $eq: ['$specialization', 'Eye'] }, 1, 0] }
          }
        }
      }
    ]);

    const result = stats[0] || {
      totalDoctors: 0,
      dentalDoctors: 0,
      eyeDoctors: 0
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
  addDoctor,
  getDoctors,
  getDoctor,
  updateDoctor,
  deleteDoctor,
  getDoctorsBySpecialization,
  getDoctorAvailability,
  getDoctorStats
};