const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add doctor name'],
    trim: true,
    maxlength: [100, 'Doctor name cannot be more than 100 characters']
  },
  specialization: {
    type: String,
    required: [true, 'Please specify specialization'],
    enum: {
      values: ['Dental', 'Eye'],
      message: 'Specialization must be either Dental or Eye'
    }
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
  availableDays: {
    type: [String],
    required: [true, 'Please specify available days'],
    validate: {
      validator: function(days) {
        const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        return days.length > 0 && days.every(day => validDays.includes(day));
      },
      message: 'Available days must be valid weekdays'
    }
  }
}, {
  timestamps: true
});

// Create indexes for better query performance
doctorSchema.index({ email: 1 });
doctorSchema.index({ specialization: 1 });
doctorSchema.index({ name: 'text' });

// Virtual for availability status
doctorSchema.virtual('isAvailableToday').get(function() {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  return this.availableDays && this.availableDays.includes(today);
});

// Method to check if doctor is available on a specific day
doctorSchema.methods.isAvailableOn = function(dayName) {
  return this.availableDays && this.availableDays.includes(dayName);
};

// Ensure virtual fields are serialized
doctorSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Doctor', doctorSchema);