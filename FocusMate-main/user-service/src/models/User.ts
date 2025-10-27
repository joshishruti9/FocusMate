import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  passwordHash: string;
  xp: number;
  coins: number;
  cosmetics: string[];
}

const UserSchema = new Schema<IUser>({
  username: { type: String, required: true },
  email: { type: String, required: true },
  passwordHash: { type: String, required: true },
  xp: { type: Number, default: 0 },
  coins: { type: Number, default: 0 },
  cosmetics: [{ type: String }],
});

export default mongoose.model<IUser>("User", UserSchema);
