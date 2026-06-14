// models/Payment.js 
import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  },
  amount: {
    type: Number,
    required: true
  },
  planId: {
    type: String
  },
  planName: {
    type: String
  },
  description: {
    type: String
  },
  authority: {
    type: String
  },
  refId: {
    type: String
  },
  cardPan: {
    type: String,
    select: false
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'expired'],
    default: 'pending'
  },
  paymentDate: {
    type: Date
  },
  schoolData: {
    type: mongoose.Schema.Types.Mixed
  },
  callbackUrl: {
    type: String
  },
  paidToCreator: {
    type: Boolean,
    default: false
  },
  forPeriodId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Period'
  },
  netAmount: {
    type: Number
  },
  type: {
    type: String,
    enum: ['full', 'installment', 'partial'],
    default: 'full'
  },
  dueDate: {
    type: Date
  }
}, {
  timestamps: true
});

// ایندکس ساده بدون unique
paymentSchema.index({ user: 1, status: 1 });
paymentSchema.index({ authority: 1 });
paymentSchema.index({ createdAt: -1 });
paymentSchema.index({ service: 1 });
paymentSchema.index({ paidToCreator: 1, service: 1 });

export default mongoose.models.Payment || mongoose.model('Payment', paymentSchema);