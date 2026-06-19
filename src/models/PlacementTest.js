import mongoose from "mongoose";

const levelRangeSchema = new mongoose.Schema(
  {
    minScore: { type: Number, required: true, min: 0 },
    maxScore: { type: Number, required: true, min: 0 },
    service: { type: mongoose.Schema.Types.ObjectId, ref: "Service" },
    label: { type: String, default: "" },
  },
  { _id: false }
);

levelRangeSchema.pre('save', function(next) {
  if (this.minScore !== undefined && this.maxScore !== undefined && this.minScore >= this.maxScore) {
    return next(new Error('minScore must be less than maxScore'));
  }
  next();
});

const placementTestSchema = new mongoose.Schema(
  {
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
      index: true,
    },
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },
    title: { type: String, trim: true },
    levelRanges: [levelRangeSchema],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.PlacementTest ||
  mongoose.model("PlacementTest", placementTestSchema);
