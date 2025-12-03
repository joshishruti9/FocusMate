import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  userEmail: {type: String, unique: true, required: true},
  firstName: {type: String, required: true},
  lastName: {type: String, required: true},
  password: {type: String, required: true},
  rewardPoints: {type: Number, default: 0},
  picture: { type: String, default: '' },
  purchasedItems: [{
    itemId: { type: String },
    name: { type: String },
    price: { type: Number },
    imageUrl: { type: String },
    purchasedAt: { type: Date, default: Date.now }
  }],
  notificationPreference: {
      enabled: { type: Boolean, default: true }
  }
});

export default mongoose.model("User", userSchema);
