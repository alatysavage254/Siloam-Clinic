const Patient = require('../models/Patient');
const { validationResult } = require('express-validator');

// @desc    Register new patient
// @route   POST /api/patients
// @access  Private
const registerPatient = async (req, res, next) => {
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

    const {
      fullName,
      phone,
      email,
      dateOfBirth,
      gender,
      address,
      nationalId,
      medicalNotes
    } = req.body;

    // Check if patient already exists
    const existingPatient = await Patient.findOne({
      $or: [{ email }, { nationalId }]
    });

    if (existingPatient) {
      return res.status(400).json({
        success: false,
        message: 'Patient with this email or national ID already exists'
      });
    }

    // Create patient
    const patient = await Patient.create({
      fullName,
      phone,
      email,
      dateOfBirth,
      gender,
      address,
      nationalId,
      medicalNotes
    });

    res.status(201).json({
      success: true,
      message: 'Patient registered successfully',
      data: patient
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all patients
// @route   GET /api/patients
// @access  Private
const getPatients = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const gender = req.query.gender;

    // Build query
    let query = {};
    
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { nationalId: { $regex: search, $options: 'i' } }
      ];
    }

    if (gender) {
      query.gender = gender;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get patients with pagination
    const patients = await Patient.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Patient.countDocuments(query);

    res.status(200).json({
      success: true,
      count: patients.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: patients
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single patient
// @route   GET /api/patients/:id
// @access  Private
const getPatient = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    res.status(200).json({
      success: true,
      data: patient
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update patient
// @route   PUT /api/patients/:id
// @access  Private
const updatePatient = async (req, res, next) => {
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

    let patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Check if email or nationalId is being changed and already exists
    if (req.body.email && req.body.email !== patient.email) {
      const existingEmail = await Patient.findOne({ email: req.body.email });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }
    }

    if (req.body.nationalId && req.body.nationalId !== patient.nationalId) {
      const existingNationalId = await Patient.findOne({ nationalId: req.body.nationalId });
      if (existingNationalId) {
        return res.status(400).json({
          success: false,
          message: 'National ID already exists'
        });
      }
    }

    patient = await Patient.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      message: 'Patient updated successfully',
      data: patient
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete patient
// @route   DELETE /api/patients/:id
// @access  Private (Admin only)
const deletePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    await Patient.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Patient deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get patient statistics
// @route   GET /api/patients/stats
// @access  Private
const getPatientStats = async (req, res, next) => {
  try {
    const stats = await Patient.aggregate([
      {
        $group: {
          _id: null,
          totalPatients: { $sum: 1 },
          malePatients: {
            $sum: { $cond: [{ $eq: ['$gender', 'Male'] }, 1, 0] }
          },
          femalePatients: {
            $sum: { $cond: [{ $eq: ['$gender', 'Female'] }, 1, 0] }
          },
          otherGenderPatients: {
            $sum: { $cond: [{ $eq: ['$gender', 'Other'] }, 1, 0] }
          }
        }
      }
    ]);

    const result = stats[0] || {
      totalPatients: 0,
      malePatients: 0,
      femalePatients: 0,
      otherGenderPatients: 0
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
  registerPatient,
  getPatients,
  getPatient,
  updatePatient,
  deletePatient,
  getPatientStats
};