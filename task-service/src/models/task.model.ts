import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  taskId: { type: Number, required: true, unique: true },
  userEmail: String,
  taskName: String,
  dueDate: String,
  category: String,
  priority: String,
  status: { type: String, default: "pending" },
  rewardGiven: { type: Boolean, default: false },
});

export default mongoose.model("Task", taskSchema);
