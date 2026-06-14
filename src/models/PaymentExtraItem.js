// models/PaymentExtraItem.js
import mongoose from 'mongoose';

const paymentExtraItemSchema = new mongoose.Schema({
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
  description: {
    type: String,
    default: ''
  },
  // نوع آیتم (اضافی یا تخفیف)
  type: {
    type: String,
    enum: ['extra', 'discount'],
    default: 'extra'
  },
  // مبلغ پیش‌فرض
  defaultAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  // قابل اعمال بر روی کلاس‌های خاص
  applicableClasses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class'
  }],
  applicableToAllClasses: {
    type: Boolean,
    default: true
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

paymentExtraItemSchema.index({ school: 1, isActive: 1 });

export default mongoose.models.PaymentExtraItem || mongoose.model('PaymentExtraItem', paymentExtraItemSchema);