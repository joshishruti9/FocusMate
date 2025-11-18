import mongoose from "mongoose";

const completedTaskSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  taskName: { type: String, required: true },
  dueDate: { type: String, required: true },
  category: { type: String },
  priority: { type: String, enum: ["Low", "Medium", "High"], default: "Low", required: true },
  description: { type: String, default: "" },
  isCompleted: { type: Boolean, default: true },
  rewardPoints: { type: Number },
  completedAt: { type: Date, default: Date.now },
});

export default mongoose.model("CompletedTask", completedTaskSchema);
