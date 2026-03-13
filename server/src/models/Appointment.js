const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: [true, 'Please specify patient']
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: [true, 'Please specify doctor']
  },
  date: {
    type: Date,
    required: [true, 'Please specify appointment date'],
    validate: {
      validator: function(value) {
        // Check if date is not in the past (allow today)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return value >= today;
      },
      message: 'Appointment date cannot be in the past'
    }
  },
  time: {
    type: String,
    required: [true, 'Please specify appointment time'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide time in HH:MM format']
  },
  reason: {
    type: String,
    required: [true, 'Please specify reason for appointment'],
    maxlength: [500, 'Reason cannot be more than 500 characters']
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'approved', 'rejected'],
      message: 'Status must be pending, approved, or rejected'
    },
    default: 'pending'
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot be more than 1000 characters']
  }
}, {
  timestamps: true
});

// Create compound indexes for better query performance
appointmentSchema.index({ patientId: 1, date: 1 });
appointmentSchema.index({ doctorId: 1, date: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ date: 1 });

// Compound index to prevent double booking
appointmentSchema.index({ doctorId: 1, date: 1, time: 1 }, { unique: true });

// Virtual for formatted date and time
appointmentSchema.virtual('formattedDateTime').get(function() {
  const date = new Date(this.date);
  return `${date.toLocaleDateString()} at ${this.time}`;
});

// Method to check if appointment is today
appointmentSchema.methods.isToday = function() {
  const today = new Date();
  const appointmentDate = new Date(this.date);
  
  return today.toDateString() === appointmentDate.toDateString();
};

// Method to check if appointment is upcoming
appointmentSchema.methods.isUpcoming = function() {
  const now = new Date();
  const appointmentDateTime = new Date(this.date);
  const [hours, minutes] = this.time.split(':');
  appointmentDateTime.setHours(parseInt(hours), parseInt(minutes));
  
  return appointmentDateTime > now;
};

// Pre-save middleware to validate doctor availability
appointmentSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('date') || this.isModified('doctorId')) {
    const Doctor = mongoose.model('Doctor');
    const doctor = await Doctor.findById(this.doctorId);
    
    if (!doctor) {
      return next(new Error('Doctor not found'));
    }
    
    const appointmentDay = new Date(this.date).toLocaleDateString('en-US', { weekday: 'long' });
    
    if (!doctor.availableDays.includes(appointmentDay)) {
      return next(new Error(`Doctor is not available on ${appointmentDay}`));
    }
  }
  
  next();
});

// Ensure virtual fields are serialized
appointmentSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Appointment', appointmentSchema);