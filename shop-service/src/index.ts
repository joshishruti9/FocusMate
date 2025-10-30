import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import shopRoutes from "./routes/shop_routes";

dotenv.config();
const app = express();
app.use(express.json());

const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/focusmate_shop";

mongoose
  .connect(mongoUri)
  .then(() => console.log("✅ Shop-service connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

app.use("/shop", shopRoutes);

app.listen(3003, () => console.log("🛍️ Shop Service running on port 3003"));

