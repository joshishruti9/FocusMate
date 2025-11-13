import mongoose from "mongoose";
import { runInNewContext } from "vm";

const taskSchema = new mongoose.Schema({
  userEmail: {type: String, required: true},
  taskName: {type: String, required: true},
  dueDate: {type: String, required: true},
  category: {type: String},
  priority: {type: String, enum: ["Low", "Medium", "High"], default: "Low", required: true},
  description: {type: String, default: ""},
  isCompleted: { type: Boolean, default: false },
});

export default mongoose.model("Task", taskSchema);
