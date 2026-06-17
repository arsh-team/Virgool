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
  if (this.code) return next();

  try {
    let attempts = 0;
    let unique = false;

    while (!unique && attempts < 5) {
      const count = (await mongoose.models.Subject?.countDocuments()) || 0;
      const code = `SUB-${(count + 1 + attempts).toString().padStart(4, '0')}`;
      const existing = await mongoose.models.Subject?.findOne({ code });
      if (!existing) {
        this.code = code;
        unique = true;
      }
      attempts++;
    }

    if (!unique) {
      this.code = `SUB-${Date.now().toString().slice(-6)}`;
    }

    next();
  } catch (error) {
    next(error);
  }
});

export default mongoose.models.Subject || mongoose.model('Subject', subjectSchema);