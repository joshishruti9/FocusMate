// src/models/user.model.ts
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    userEmail: { type: String, unique: true, required: true },
    firstName: { type: String, required: true },
    lastName:  { type: String, required: true },

    // optional; we'll enforce requirements in controllers instead of schema magic
    password: {
      type: String,
      required: false,
    },

    rewardPoints: { type: Number, default: 0 },
    googleSub: { type: String, unique: true, sparse: true },
    avatarUrl: { type: String },
  },
  { timestamps: true }
);

// 🚨 no generics here, no Model<IUser>, nothing fancy
const User = mongoose.model("User", userSchema);

export default User;
