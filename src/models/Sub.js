import mongoose from "mongoose";

const subSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true, min: 0 },
    bankNumber: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "processed", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Sub || mongoose.model("Sub", subSchema);
