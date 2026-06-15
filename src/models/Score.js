import mongoose from 'mongoose';
const detailSchema = new mongoose.Schema({
  optionName: { type: String, required: true },
  score: { type: Number, required: true }
});
const scoreSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  enrollment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Enrollment'
  },
  details: { 
    type: [detailSchema], 
    default: [] 
  }
}, {
  timestamps: true
});
scoreSchema.index({ user: 1, service: 1 });
scoreSchema.index({ service: 1 });
export default mongoose.models.Score || mongoose.model('Score', scoreSchema);