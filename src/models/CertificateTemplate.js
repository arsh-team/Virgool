// models/CertificateTemplate.js
import mongoose from 'mongoose';

const certificateTemplateSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String },
  school: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  type: { 
    type: String, 
    enum: ['achievement', 'participation', 'excellence', 'graduation', 'custom'],
    default: 'achievement'
  },
  templateData: {
    backgroundColor: { type: String, default: '#ffffff' },
    borderColor: { type: String, default: '#1e40af' },
    logoUrl: { type: String },
    title: { type: String, default: 'گواهی‌نامه' },
    subtitle: { type: String },
    bodyText: { type: String },
    footerText: { type: String },
    signatureTitle: { type: String },
    showDate: { type: Boolean, default: true },
    showStudentPhoto: { type: Boolean, default: false }
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

certificateTemplateSchema.index({ school: 1 });

export default mongoose.models.CertificateTemplate || mongoose.model('CertificateTemplate', certificateTemplateSchema);
