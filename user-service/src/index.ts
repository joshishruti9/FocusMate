import express from "express";
import mongoose from "mongoose";
import userRoutes from "./routes/user_routes"; // adjust path if needed

const app = express();
app.use(express.json());

const mongoUri = "mongodb://localhost:27017/focusmate_users";

mongoose.connect(mongoUri)
  .then(() => console.log("✅ User-service connected to MongoDB"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

app.use("/users", userRoutes);

const PORT = 4001;
app.listen(PORT, () => console.log(`👤 User Service running on port ${PORT}`));
