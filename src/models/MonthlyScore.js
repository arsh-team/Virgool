// models/MonthlyScore.js
import mongoose from 'mongoose';

const monthlyScoreSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  school: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  academicYear: { type: String, required: true },
  month: { type: String, required: true },
  monthNumber: { type: Number, required: true, min: 1, max: 9 },
  scores: {
    oral: { type: Number, min: 0, max: 20, default: null },
    written: { type: Number, min: 0, max: 20, default: null },
    homework: { type: Number, min: 0, max: 20, default: null },
    activity: { type: Number, min: 0, max: 20, default: null },
    exam: { type: Number, min: 0, max: 20, default: null }
  },
  average: { type: Number, min: 0, max: 20, default: null },
  status: { type: String, enum: ['not_started', 'in_progress', 'completed'], default: 'not_started' },
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  comment: { type: String }
}, { timestamps: true });

monthlyScoreSchema.pre('save', function(next) {
  const scores = Object.values(this.scores).filter(s => s !== null && s !== undefined);
  if (scores.length > 0) {
    this.average = scores.reduce((a, b) => a + b, 0) / scores.length;
  }
  next();
});

monthlyScoreSchema.index({ student: 1, subject: 1, class: 1, academicYear: 1, monthNumber: 1 }, { unique: true });

export default mongoose.models.MonthlyScore || mongoose.model('MonthlyScore', monthlyScoreSchema);