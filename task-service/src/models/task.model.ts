import mongoose from "mongoose";
import { runInNewContext } from "vm";

const taskSchema = new mongoose.Schema({
  userEmail: String,
  taskName: String,
  dueDate: String,
  category: String,
  priority: {type: String, enum: ["Low", "Medium", "High"], default: "Low"},
  description: String,
  isCompleted: { type: Boolean, default: false },
  rewardPoints: Number,
});


export default mongoose.model("Task", taskSchema);
