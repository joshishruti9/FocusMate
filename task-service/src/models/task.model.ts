import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  taskName: { type: String, required: true },
  dueDate: { type: String, required: true },
  category: { type: String },
  priority: { type: String, enum: ["Low", "Medium", "High"], default: "Low", required: true },
  description: { type: String, default: "" },
  isCompleted: { type: Boolean, default: false },
  reminder: {
    enabled: { type: Boolean, default: false },
    remindAt: { type: String, default: ''},
  },
});

export default mongoose.model("Task", taskSchema);
