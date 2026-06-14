import mongoose from "mongoose";

const periodSchema = new mongoose.Schema(
  {
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
      index: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    durationDays: {
      type: Number,
      required: true,
      min: 1,
    },
    isActive: {
      type: Boolean,
      default: false,
      index: true,
    },
    isAutoCreated: {
      type: Boolean,
      default: false,
    },
    paymentsCreated: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

periodSchema.index({ service: 1, isActive: 1 });
periodSchema.index({ service: 1, endDate: -1 });

export default mongoose.models.Period || mongoose.model("Period", periodSchema);
