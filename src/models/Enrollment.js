// models/Enrollment.js
import mongoose from "mongoose";
const enrollmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Service",
    required: true
  },
  enrolledAt: {
    type: Date,
    default: Date.now
  },
  amount: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  completed: {
    type: Boolean,
    default: false
  },
  lastAccessed: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String
  },
  lastPayment: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});
enrollmentSchema.index({ user: 1, service: 1 }, { unique: true });
enrollmentSchema.index({ service: 1 });
export default mongoose.models.Enrollment || mongoose.model("Enrollment", enrollmentSchema);