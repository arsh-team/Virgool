// models/Class.js
import mongoose from 'mongoose';

const classSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  grade: { type: String, required: true },
  academicYear: {
    type: String,
    required: true,
    default: () => {
      const now = new Date();
      const year = now.getFullYear();
      return `${year}-${year + 1}`;
    }
  },
  school: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  assistantTeacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, required: false },
  capacity: { type: Number, default: 30 },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  schedule: { type: Map, of: String },
  classCode: { type: String, unique: true, sparse: true },
  isActive: { type: Boolean, default: true },
  classroom: { type: String, default: "" }
}, { timestamps: true });

classSchema.index({ school: 1 });
classSchema.index({ teacher: 1 });
classSchema.index({ school: 1, isActive: 1 });

classSchema.pre('save', async function(next) {
  if (this.classCode) return next();

  try {
    const year = new Date().getFullYear();
    let attempts = 0;
    let unique = false;

    while (!unique && attempts < 5) {
      const count = (await mongoose.models.Class?.countDocuments()) || 0;
      const code = `CLS-${year}-${(count + 1 + attempts).toString().padStart(4, '0')}`;
      const existing = await mongoose.models.Class?.findOne({ classCode: code });
      if (!existing) {
        this.classCode = code;
        unique = true;
      }
      attempts++;
    }

    if (!unique) {
      // Fallback with timestamp to ensure uniqueness
      this.classCode = `CLS-${year}-${Date.now().toString().slice(-6)}`;
    }

    next();
  } catch (error) {
    next(error);
  }
});

export default mongoose.models.Class || mongoose.model('Class', classSchema);