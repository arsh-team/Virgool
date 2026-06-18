// models/EducationalContent.js
import mongoose from 'mongoose';

const educationalContentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  // videoUrl is only required for video type; document/quiz types may not have a video
  videoUrl: { type: String, required: function() { return this.type === 'video'; } },
  type: { type: String, enum: ['video', 'document', 'quiz'], default: 'video' },
  order: { type: Number, default: 0 },
  isPublished: { type: Boolean, default: false },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

educationalContentSchema.index({ classId: 1 });
educationalContentSchema.index({ schoolId: 1 });
educationalContentSchema.index({ schoolId: 1, classId: 1 });

export default mongoose.models.EducationalContent || mongoose.model('EducationalContent', educationalContentSchema);