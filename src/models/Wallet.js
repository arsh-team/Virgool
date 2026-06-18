// models/Wallet.js
import mongoose from 'mongoose';
const walletSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  balance: {
    type: Number,
    default: 0,
    min: 0
  },
  pendingBalance: {
    type: Number,
    default: 0,
    min: 0
  },
  totalEarnings: {
    type: Number,
    default: 0,
    min: 0
  },
  transactions: [{
    type: {
      type: String,
      enum: ['income', 'withdrawal', 'refund'],
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service'
    },
    enrollment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Enrollment'
    },
    description: String,
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

walletSchema.pre('save', function(next) {
  // Limit transactions array to prevent hitting MongoDB 16MB document limit
  const MAX_TRANSACTIONS = 1000;
  if (this.transactions && this.transactions.length > MAX_TRANSACTIONS) {
    // Keep only the most recent transactions
    this.transactions = this.transactions.slice(-MAX_TRANSACTIONS);
  }
  next();
});

export default mongoose.models.Wallet || mongoose.model('Wallet', walletSchema);