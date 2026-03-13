const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Please add patient full name'],
    trim: true,
    maxlength: [100, 'Full name cannot be more than 100 characters']
  },
  phone: {
    type: String,
    required: [true, 'Please add phone number'],
    match: [/^[\+]?[0-9\s\-\(\)]{10,15}$/, 'Please add a valid phone number']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Please add date of birth'],
    validate: {
      validator: function(value) {
        return value < new Date();
      },
      message: 'Date of birth must be in the past'
    }
  },
  gender: {
    type: String,
    required: [true, 'Please specify gender'],
    enum: {
      values: ['Male', 'Female', 'Other'],
      message: 'Gender must be Male, Female, or Other'
    }
  },
  address: {
    type: String,
    required: [true, 'Please add address'],
    maxlength: [200, 'Address cannot be more than 200 characters']
  },
  nationalId: {
    type: String,
    required: [true, 'Please add national ID'],
    unique: true,
    trim: true,
    maxlength: [20, 'National ID cannot be more than 20 characters']
  },
  medicalNotes: {
    type: String,
    maxlength: [1000, 'Medical notes cannot be more than 1000 characters']
  }
}, {
  timestamps: true
});

// Create indexes for better query performance
patientSchema.index({ email: 1 });
patientSchema.index({ nationalId: 1 });
patientSchema.index({ fullName: 'text' });

// Virtual for age calculation
patientSchema.virtual('age').get(function() {
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
});

// Ensure virtual fields are serialized
patientSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Patient', patientSchema);