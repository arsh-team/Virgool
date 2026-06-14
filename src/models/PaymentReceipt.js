// models/PaymentReceipt.js

import mongoose from 'mongoose';
import crypto from 'crypto';

const receiptItemSchema = new mongoose.Schema({
  feeItemId: { type: String, required: true },
  feeItemName: { type: String, required: true },
  amount: { type: Number, required: true, min: 0 },
  previousPaid: { type: Number, default: 0 },
  newTotalPaid: { type: Number, default: 0 },
  remainingAfterPayment: { type: Number, default: 0 }
});

const paymentReceiptSchema = new mongoose.Schema({
  receiptNumber: {
    type: String,
    unique: true,
    sparse: true  // اجازه می‌دهد در حین save مقداردهی شود
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  studentName: { type: String, required: true },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  className: { type: String, required: true },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true,
    index: true
  },
  schoolName: { type: String, required: true },
  studentPaymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudentPayment',
    required: true
  },
  academicYear: { type: String, required: true },
  amount: { type: Number, required: true, min: 0 },
  paymentItems: [receiptItemSchema],
  paymentMethod: {
    type: String,
    enum: ['cash', 'transfer', 'cheque', 'pos'],
    required: true
  },
  paymentMethodDetails: { type: String, default: '' },
  paymentDate: { type: Date, default: Date.now, required: true },
  receiptImage: { type: String, default: null },
  receiptImagePublicId: { type: String, default: null },
  description: { type: String, default: '' },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recordedByName: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'verified'
  },
  rejectionReason: { type: String, default: '' }
}, { timestamps: true });

// Generate receipt number before saving - استفاده از تابع معمولی به جای async
paymentReceiptSchema.pre('save', function(next) {
  if (!this.receiptNumber) {
    // تولید شماره رسید با فرمت RCP-YYYY-XXXXXX
    const year = new Date().getFullYear();
    const random = crypto.randomBytes(3).toString('hex').toUpperCase().padStart(6, '0');
    this.receiptNumber = `RCP-${year}-${random}`;
  }
  next();
});

paymentReceiptSchema.index({ student: 1, paymentDate: -1 });
paymentReceiptSchema.index({ school: 1, status: 1, paymentDate: -1 });
paymentReceiptSchema.index({ student: 1, studentPaymentId: 1 });

export default mongoose.models.PaymentReceipt || mongoose.model('PaymentReceipt', paymentReceiptSchema);