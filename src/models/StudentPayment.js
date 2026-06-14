// models/StudentPayment.js
import mongoose from 'mongoose';

const paymentItemSchema = new mongoose.Schema({
  feeItemId: {
    type: String, 
    required: true
  },
  feeItemName: {
    type: String,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true 
  },
  paidAmount: {
    type: Number,
    default: 0
  },
  remainingAmount: {
    type: Number,
    default: 0 
  },
  isFullyPaid: {
    type: Boolean,
    default: false
  }
});

const studentPaymentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true,
    index: true
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true,
    index: true
  },
  schoolFee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SchoolFee',
    required: true
  },
  academicYear: {
    type: String,
    required: true
  },
  // آیتم‌های پرداختی تفکیک شده
  paymentItems: [paymentItemSchema],
  // کل مبلغ قابل پرداخت
  totalAmount: {
    type: Number,
    default: 0
  },
  // کل مبلغ پرداخت شده
  totalPaid: {
    type: Number,
    default: 0
  },
  // مبلغ باقی مانده
  totalRemaining: {
    type: Number,
    default: 0
  },
  // وضعیت کلی پرداخت
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'partial', 'fully_paid', 'overpaid'],
    default: 'unpaid'
  },
  // تخفیف اعمال شده بر روی دانش‌آموز
  appliedDiscount: {
    type: Number,
    default: 0
  },
  discountReason: {
    type: String,
    default: ''
  },
  notes: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Pre-save hook to calculate totals
studentPaymentSchema.pre('save', function(next) {
  this.totalAmount = this.paymentItems.reduce((sum, item) => sum + item.totalAmount, 0);
  this.totalPaid = this.paymentItems.reduce((sum, item) => sum + item.paidAmount, 0);
  this.totalRemaining = this.totalAmount - this.totalPaid;
  
  if (this.totalRemaining <= 0 && this.totalPaid > 0) {
    this.paymentStatus = this.totalPaid > this.totalAmount ? 'overpaid' : 'fully_paid';
  } else if (this.totalPaid > 0) {
    this.paymentStatus = 'partial';
  } else {
    this.paymentStatus = 'unpaid';
  }
  
  next();
});

studentPaymentSchema.index({ student: 1, school: 1, academicYear: 1 });
studentPaymentSchema.index({ class: 1, paymentStatus: 1 });

export default mongoose.models.StudentPayment || mongoose.model('StudentPayment', studentPaymentSchema);