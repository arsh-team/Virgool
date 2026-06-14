// models/Discipline.js
import mongoose from 'mongoose';

const disciplineSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['warning', 'probation', 'suspension', 'expulsion', 'commendation'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  points: {
    type: Number,
    default: 0
  },
  attachments: [{
    name: String,
    url: String
  }],
  isResolved: {
    type: Boolean,
    default: false
  },
  resolvedAt: Date,
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolutionNote: String
}, { timestamps: true });

disciplineSchema.index({ student: 1, date: -1 });
disciplineSchema.index({ school: 1, type: 1 });
disciplineSchema.index({ class: 1 });
disciplineSchema.index({ school: 1, class: 1 });

export default mongoose.models.Discipline || mongoose.model('Discipline', disciplineSchema);