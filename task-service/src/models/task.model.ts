import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  userEmail: String,
  title: String,
  description: String,
  priority: String,
  difficulty: String,
  status: { type: String, default: "pending" },
  rewardGiven: { type: Boolean, default: false },
});

export default mongoose.model("Task", taskSchema);
