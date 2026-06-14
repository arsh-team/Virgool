// models/Class.js
import mongoose from 'mongoose';

const classSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  grade: { type: String, required: true },
  academicYear: { type: String, required: true, default: "1404-1405" },
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
  if (!this.classCode) {
    const year = new Date().getFullYear();
    const Model = mongoose.models.Class;
    const count = Model ? await Model.countDocuments() : 0;
    this.classCode = `CLS-${year}-${(count + 1).toString().padStart(4, '0')}`;
  }
  next();
});

export default mongoose.models.Class || mongoose.model('Class', classSchema);