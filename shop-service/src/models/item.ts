import mongoose, { Schema, Document } from "mongoose";

export interface IItem extends Document {
  name: string;
  price: number;
  imageUrl: string;
}

const ItemSchema = new Schema<IItem>({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  imageUrl: String,
});

export default mongoose.model<IItem>("Item", ItemSchema);
