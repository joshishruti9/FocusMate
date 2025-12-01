import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors"; // ✅ add this line
import shopRoutes from "./routes/shop_routes";

dotenv.config();
const app = express();

// ✅ Middleware
app.use(cors()); // Allow requests from Angular frontend
app.use(express.json());

// 🟢 MongoDB connection string
const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/focusmate";

mongoose
  .connect(mongoUri)
  .then(() => console.log("✅ Shop-service connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// 🟢 API Routes
app.use("/shop", shopRoutes);

// 🟢 Start server
const PORT = process.env.PORT || 3003;
app.listen(PORT, () => console.log(`🛍️ Shop Service running on port ${PORT}`));
