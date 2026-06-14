// models/Attempt.js
import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema({
  questionId: {
    type: String,
    required: true
  },
  question: {
    type: String,
    required: true
  },
  userAnswer: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  isCorrect: {
    type: Boolean,
    default: false
  },
  pointsEarned: {
    type: Number,
    default: 0
  },
  answeredAt: {
    type: Date,
    default: Date.now
  }
});

const attemptSchema = new mongoose.Schema({
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true,
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    index: true
  },
  startTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  timeSpent: {
    type: Number,
    default: 0
  },
  answers: [answerSchema],
  score: {
    type: Number,
    default: 0
  },
  percentage: {
    type: Number,
    default: 0
  },
  passed: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['in_progress', 'paused', 'completed', 'expired', 'abandoned'],
    default: 'in_progress'
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  remainingTime: {
    type: Number,
    default: null
  },
  attemptNumber: {
    type: Number,
    default: 1
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
attemptSchema.index({ quiz: 1, user: 1, status: 1 });
attemptSchema.index({ quiz: 1, user: 1, attemptNumber: 1 });
attemptSchema.index({ status: 1, lastActivity: 1 });

// Don't use unique index on quiz+user+status because users can have multiple quizzes
// Only ensure unique active attempt per quiz per user
// This is handled by application logic, not database constraint

export default mongoose.models.Attempt || mongoose.model('Attempt', attemptSchema);