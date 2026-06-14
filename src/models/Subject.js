// models/Subject.js
import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, unique: true },
  school: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  classes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Class' }],
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  textbook: { type: String },
  hoursPerWeek: { type: Number, default: 2 },
  totalSessions: { type: Number, default: 0 },
  description: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

subjectSchema.index({ school: 1 });
subjectSchema.index({ teacher: 1 });

subjectSchema.pre('save', async function(next) {
  if (!this.code) {
    const count = await mongoose.models.Subject?.countDocuments() || 0;
    this.code = `SUB-${(count + 1).toString().padStart(4, '0')}`;
  }
  next();
});

export default mongoose.models.Subject || mongoose.model('Subject', subjectSchema);