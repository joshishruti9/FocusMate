import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  userEmail: String,
  taskName: String,
  dueDate: String,
  category: String,
  priority: String,
  status: { type: String, default: "pending" },
  rewardGiven: { type: Boolean, default: false },
});

export default mongoose.model("Task", taskSchema);
