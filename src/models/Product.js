import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    category: { type: String, default: "عمومی", trim: true },
    level: { type: String, default: "همه سطوح", trim: true },
    hours: { type: Number, default: 0, min: 0 },
    price: { type: Number, default: 0, min: 0 },
    score: { type: Number, default: 0, min: 0 },
    rating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0, min: 0 },
    },
    quizzes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Quiz" }],
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    isPublished: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

productSchema.index({ creator: 1 });
productSchema.index({ category: 1, isPublished: 1 });

export default mongoose.models.Product || mongoose.model("Product", productSchema);
