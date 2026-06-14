import mongoose from 'mongoose';
const withdrawalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'processed', 'rejected', 'completed'],
    default: 'pending'
  },
  bankInfo: {
    cardNumber: String,
    shebaNumber: String,
    accountHolder: String
  },
  processedAt: Date,
  completedAt: Date,
  rejectionReason: String
}, {
  timestamps: true
});
withdrawalSchema.index({ user: 1 });
withdrawalSchema.index({ user: 1, status: 1 });
export default mongoose.models.Withdrawal || mongoose.model('Withdrawal', withdrawalSchema);