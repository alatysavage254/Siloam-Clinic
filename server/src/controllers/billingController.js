const Billing = require('../models/Billing');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const { validationResult } = require('express-validator');
const pdfService = require('../services/pdfService');
const path = require('path');
const fs = require('fs');

// @desc    Create billing record and generate invoice
// @route   POST /api/billing
// @access  Private
const createBilling = async (req, res, next) => {
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

    const { patientId, doctorId, appointmentId, services } = req.body;

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

    // Verify appointment exists
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if billing already exists for this appointment
    const existingBilling = await Billing.findOne({ appointmentId });
    if (existingBilling) {
      return res.status(400).json({
        success: false,
        message: 'Billing record already exists for this appointment'
      });
    }

    // Validate services array
    if (!services || !Array.isArray(services) || services.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one service is required'
      });
    }

    // Calculate total amount
    const totalAmount = services.reduce((total, service) => total + service.cost, 0);

    // Create billing record
    const billing = await Billing.create({
      patientId,
      doctorId,
      appointmentId,
      services,
      totalAmount
    });

    // Generate PDF invoice
    try {
      const pdfPath = await pdfService.generateInvoice(billing, patient, doctor, appointment);
      billing.pdfPath = pdfPath;
      await billing.save();
    } catch (pdfError) {
      console.error('PDF generation failed:', pdfError);
      // Don't fail the request if PDF generation fails
    }

    // Populate the billing record
    const populatedBilling = await Billing.findById(billing._id)
      .populate('patientId', 'fullName phone email')
      .populate('doctorId', 'name specialization')
      .populate('appointmentId', 'date time reason');

    res.status(201).json({
      success: true,
      message: 'Billing record created successfully',
      data: populatedBilling
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all billing records
// @route   GET /api/billing
// @access  Private
const getBillingRecords = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const paymentStatus = req.query.paymentStatus;
    const patientId = req.query.patientId;
    const doctorId = req.query.doctorId;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;

    // Build query
    let query = {};
    
    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    if (patientId) {
      query.patientId = patientId;
    }

    if (doctorId) {
      query.doctorId = doctorId;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setDate(end.getDate() + 1);
        query.createdAt.$lt = end;
      }
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get billing records with pagination and population
    const billingRecords = await Billing.find(query)
      .populate('patientId', 'fullName phone email')
      .populate('doctorId', 'name specialization')
      .populate('appointmentId', 'date time')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Billing.countDocuments(query);

    res.status(200).json({
      success: true,
      count: billingRecords.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: billingRecords
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single billing record
// @route   GET /api/billing/:id
// @access  Private
const getBillingRecord = async (req, res, next) => {
  try {
    const billing = await Billing.findById(req.params.id)
      .populate('patientId', 'fullName phone email address')
      .populate('doctorId', 'name specialization phone email')
      .populate('appointmentId', 'date time reason');

    if (!billing) {
      return res.status(404).json({
        success: false,
        message: 'Billing record not found'
      });
    }

    res.status(200).json({
      success: true,
      data: billing
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update billing record
// @route   PUT /api/billing/:id
// @access  Private
const updateBillingRecord = async (req, res, next) => {
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

    let billing = await Billing.findById(req.params.id);

    if (!billing) {
      return res.status(404).json({
        success: false,
        message: 'Billing record not found'
      });
    }

    // Update billing record
    billing = await Billing.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('patientId', 'fullName phone email')
     .populate('doctorId', 'name specialization')
     .populate('appointmentId', 'date time');

    res.status(200).json({
      success: true,
      message: 'Billing record updated successfully',
      data: billing
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark billing as paid
// @route   PUT /api/billing/:id/pay
// @access  Private
const markAsPaid = async (req, res, next) => {
  try {
    const { paymentMethod } = req.body;

    if (!paymentMethod || !['cash', 'card', 'mobile_money', 'bank_transfer'].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: 'Valid payment method is required (cash, card, mobile_money, bank_transfer)'
      });
    }

    const billing = await Billing.findById(req.params.id);

    if (!billing) {
      return res.status(404).json({
        success: false,
        message: 'Billing record not found'
      });
    }

    if (billing.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Billing record is already marked as paid'
      });
    }

    // Mark as paid
    await billing.markAsPaid(paymentMethod);

    const updatedBilling = await Billing.findById(billing._id)
      .populate('patientId', 'fullName phone email')
      .populate('doctorId', 'name specialization');

    res.status(200).json({
      success: true,
      message: 'Payment recorded successfully',
      data: updatedBilling
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Download invoice PDF
// @route   GET /api/billing/:id/invoice
// @access  Private
const downloadInvoice = async (req, res, next) => {
  try {
    const billing = await Billing.findById(req.params.id)
      .populate('patientId', 'fullName phone email address')
      .populate('doctorId', 'name specialization')
      .populate('appointmentId', 'date time reason');

    if (!billing) {
      return res.status(404).json({
        success: false,
        message: 'Billing record not found'
      });
    }

    // Check if PDF exists
    if (billing.pdfPath && fs.existsSync(billing.pdfPath)) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="invoice-${billing.invoiceNumber}.pdf"`);
      
      const fileStream = fs.createReadStream(billing.pdfPath);
      fileStream.pipe(res);
    } else {
      // Generate PDF if it doesn't exist
      try {
        const patient = billing.patientId;
        const doctor = billing.doctorId;
        const appointment = billing.appointmentId;
        
        const pdfPath = await pdfService.generateInvoice(billing, patient, doctor, appointment);
        billing.pdfPath = pdfPath;
        await billing.save();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="invoice-${billing.invoiceNumber}.pdf"`);
        
        const fileStream = fs.createReadStream(pdfPath);
        fileStream.pipe(res);
      } catch (pdfError) {
        console.error('PDF generation failed:', pdfError);
        return res.status(500).json({
          success: false,
          message: 'Failed to generate invoice PDF'
        });
      }
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get billing statistics
// @route   GET /api/billing/stats
// @access  Private
const getBillingStats = async (req, res, next) => {
  try {
    const stats = await Billing.getRevenueStats();

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete billing record
// @route   DELETE /api/billing/:id
// @access  Private (Admin only)
const deleteBillingRecord = async (req, res, next) => {
  try {
    const billing = await Billing.findById(req.params.id);

    if (!billing) {
      return res.status(404).json({
        success: false,
        message: 'Billing record not found'
      });
    }

    // Delete PDF file if exists
    if (billing.pdfPath && fs.existsSync(billing.pdfPath)) {
      fs.unlinkSync(billing.pdfPath);
    }

    await Billing.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Billing record deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBilling,
  getBillingRecords,
  getBillingRecord,
  updateBillingRecord,
  markAsPaid,
  downloadInvoice,
  getBillingStats,
  deleteBillingRecord
};