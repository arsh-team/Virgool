// models/SchoolFee.js
import mongoose from 'mongoose';

const feeItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  isRequired: {
    type: Boolean,
    default: true
  },
  description: {
    type: String,
    default: ''
  }
});

const schoolFeeSchema = new mongoose.Schema({
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  academicYear: {
    type: String,
    required: true,
    default: "1404-1405"
  },
  applyToAllClasses: {
    type: Boolean,
    default: true
  },
  classIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class'
  }],
  feeItems: [feeItemSchema],
  totalAmount: {
    type: Number,
    default: 0
  },
  // تخفیف‌های قابل اعمال
  discounts: [{
    name: String,
    type: { type: String, enum: ['percentage', 'fixed'] },
    value: { type: Number, min: 0 },
    applicableTo: [String] 
  }],
  paymentTerms: {
    type: String,
    default: 'monthly'
  },
  numberOfInstallments: {
    type: Number,
    default: 9 
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

// Pre-save hook to calculate total amount
schoolFeeSchema.pre('save', function(next) {
  this.totalAmount = this.feeItems.reduce((sum, item) => sum + item.amount, 0);
  next();
});

schoolFeeSchema.index({ school: 1, academicYear: 1 });

export default mongoose.models.SchoolFee || mongoose.model('SchoolFee', schoolFeeSchema);