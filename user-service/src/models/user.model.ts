import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  userEmail: {type: String, unique: true, required: true},
  firstName: {type: String, required: true},
  lastName: {type: String, required: true},
  password: {type: String, required: true},
  rewardPoints: {type: Number, default: 0}
});

export default mongoose.model("User", userSchema);
