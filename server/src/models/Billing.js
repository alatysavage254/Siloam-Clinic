const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please specify service name'],
    trim: true,
    maxlength: [100, 'Service name cannot be more than 100 characters']
  },
  cost: {
    type: Number,
    required: [true, 'Please specify service cost'],
    min: [0, 'Service cost cannot be negative']
  }
});

const billingSchema = new mongoose.Schema({
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
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: [true, 'Please specify appointment']
  },
  invoiceNumber: {
    type: String,
    unique: true
  },
  services: {
    type: [serviceSchema],
    required: [true, 'Please specify at least one service'],
    validate: {
      validator: function(services) {
        return services && services.length > 0;
      },
      message: 'At least one service is required'
    }
  },
  totalAmount: {
    type: Number,
    required: [true, 'Please specify total amount'],
    min: [0, 'Total amount cannot be negative']
  },
  pdfPath: {
    type: String
  },
  paymentStatus: {
    type: String,
    enum: {
      values: ['pending', 'paid', 'overdue'],
      message: 'Payment status must be pending, paid, or overdue'
    },
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'mobile_money', 'bank_transfer'],
    required: function() {
      return this.paymentStatus === 'paid';
    }
  },
  paidAt: {
    type: Date,
    required: function() {
      return this.paymentStatus === 'paid';
    }
  }
}, {
  timestamps: true
});

// Create indexes for better query performance
billingSchema.index({ invoiceNumber: 1 });
billingSchema.index({ patientId: 1 });
billingSchema.index({ doctorId: 1 });
billingSchema.index({ appointmentId: 1 });
billingSchema.index({ paymentStatus: 1 });
billingSchema.index({ createdAt: -1 });

// Pre-save middleware to generate invoice number
billingSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      // Generate invoice number: INV-YYYYMMDD-XXXX
      const date = new Date();
      const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
      
      // Find the last invoice for today
      const lastInvoice = await this.constructor.findOne({
        invoiceNumber: new RegExp(`^INV-${dateStr}-`)
      }).sort({ invoiceNumber: -1 });
      
      let sequence = 1;
      if (lastInvoice) {
        const lastSequence = parseInt(lastInvoice.invoiceNumber.split('-')[2]);
        sequence = lastSequence + 1;
      }
      
      this.invoiceNumber = `INV-${dateStr}-${sequence.toString().padStart(4, '0')}`;
    } catch (error) {
      return next(error);
    }
  }
  
  // Calculate total amount from services
  if (this.isModified('services')) {
    this.totalAmount = this.services.reduce((total, service) => total + service.cost, 0);
  }
  
  next();
});

// Virtual for formatted total amount
billingSchema.virtual('formattedTotal').get(function() {
  return `KES ${this.totalAmount.toLocaleString()}`;
});

// Method to mark as paid
billingSchema.methods.markAsPaid = function(paymentMethod) {
  this.paymentStatus = 'paid';
  this.paymentMethod = paymentMethod;
  this.paidAt = new Date();
  return this.save();
};

// Method to check if overdue (30 days)
billingSchema.methods.isOverdue = function() {
  if (this.paymentStatus === 'paid') return false;
  
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  return this.createdAt < thirtyDaysAgo;
};

// Static method to get revenue statistics
billingSchema.statics.getRevenueStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$totalAmount' },
        paidRevenue: {
          $sum: {
            $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$totalAmount', 0]
          }
        },
        pendingRevenue: {
          $sum: {
            $cond: [{ $eq: ['$paymentStatus', 'pending'] }, '$totalAmount', 0]
          }
        },
        totalInvoices: { $sum: 1 },
        paidInvoices: {
          $sum: {
            $cond: [{ $eq: ['$paymentStatus', 'paid'] }, 1, 0]
          }
        }
      }
    }
  ]);
  
  return stats[0] || {
    totalRevenue: 0,
    paidRevenue: 0,
    pendingRevenue: 0,
    totalInvoices: 0,
    paidInvoices: 0
  };
};

// Ensure virtual fields are serialized
billingSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Billing', billingSchema);