import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: String,
  firstName: String,
  lastName: String,
  password: String,
  rewardPoints: Number
});

export default mongoose.model("User", userSchema);
