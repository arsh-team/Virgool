// models/Service.js
import mongoose from 'mongoose';
const serviceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  category: {
    type: String,
    required: true,
    enum: ['آموزشی', 'مشاوره', 'طراحی', 'برنامه‌نویسی', 'محتوا', 'سایر']
  },
  serviceType: {
    type: String,
    required: true,
    enum: ['حضوری', 'غیرحضوری', 'هیبریدی']
  },
  description: {
    type: String,
    required: true
  },
  instructor: {
    type: String,
    required: function() {
      return this.category === 'آموزشی';
    }
  },
  instructorBio: {
    type: String
  },
  instructorImage: {
    type: String
  },
  poster: {
    type: String,
    required: true
  },
  videoPreview: {
    type: String
  },
  address: {
    type: String,
    required: function() {
      return this.serviceType === 'حضوری' || this.serviceType === 'هیبریدی';
    }
  },
  onlineMethod: {
    type: String,
    required: function() {
      return this.serviceType === 'غیرحضوری' || this.serviceType === 'هیبریدی';
    }
  },
  sessionsCount: {
    type: Number,
    required: true,
    min: 1
  },
  sessionDuration: {
    type: String,
    required: function() {
      return this.category === 'آموزشی';
    }
  },
  level: {
    type: String,
    enum: ['مقدماتی', 'متوسط', 'پیشرفته', 'همه سطوح'],
    required: function() {
      return this.category === 'آموزشی';
    }
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  discountPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  features: [{
    title: String,
    description: String,
    icon: String
  }],
  prerequisites: [{
    type: String
  }],
  whatYouLearn: [{
    type: String
  }],
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fromUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['فعال', 'غیرفعال', 'در انتظار تایید'],
    default: 'در انتظار تایید'
  },
  studentsCount: {
    type: Number,
    default: 0
  },
  rating: {
    average: {
      type: Number,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  },
  maxCapacity: {
    type: Number,
    default: 0
  },
  isRegistrationOpen: {
    type: Boolean,
    default: true
  },
  subscriptionPlan: {
    type: String,
    enum: ['BRONZE', 'SILVER', 'GOLD'],
    default: 'BRONZE'
  },
  subscriptionStartDate: {
    type: Date,
    default: null
  },
  subscriptionExpiry: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});
// Virtuals
serviceSchema.virtual('priceAfterDiscount').get(function() {
  return Math.round(this.price * (1 - this.discountPercentage / 100));
});
serviceSchema.virtual('isOnSale').get(function() {
  return this.discountPercentage > 0;
});
serviceSchema.virtual('subscriptionActive').get(function() {
  if (!this.subscriptionExpiry) {
    // BRONZE (free tier) is always active; paid tiers without expiry are inactive
    return !this.subscriptionPlan || this.subscriptionPlan === 'BRONZE';
  }
  return new Date(this.subscriptionExpiry) > new Date();
});
serviceSchema.virtual('daysUntilSubscriptionExpiry').get(function() {
  if (!this.subscriptionExpiry) return null;
  const diff = new Date(this.subscriptionExpiry) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});
serviceSchema.virtual('totalDuration').get(function() {
  if (this.category === 'آموزشی' && this.sessionDuration && this.sessionsCount) {
    const duration = parseInt(this.sessionDuration);
    if (isNaN(duration)) return 0;
    return `${this.sessionsCount * duration} ساعت`;
  }
  return null;
});
// Indexes
serviceSchema.index({ creator: 1 });
serviceSchema.index({ fromUserId: 1 });
serviceSchema.index({ status: 1 });
export default mongoose.models.Service || mongoose.model('Service', serviceSchema);