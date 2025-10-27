import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";
import { verifyJWT } from "./middleware/authMiddleware.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Route forwarding
app.use("/api/user", verifyJWT, async (req, res) => {
  const response = await axios({
    method: req.method,
    url: `${process.env.USER_SERVICE_URL}${req.url}`,
    data: req.body,
  });
  res.json(response.data);
});

app.use("/api/task", verifyJWT, async (req, res) => {
  const response = await axios({
    method: req.method,
    url: `${process.env.TASK_SERVICE_URL}${req.url}`,
    data: req.body,
  });
  res.json(response.data);
});

app.use("/api/reward", verifyJWT, async (req, res) => {
  const response = await axios({
    method: req.method,
    url: `${process.env.REWARD_SERVICE_URL}${req.url}`,
    data: req.body,
  });
  res.json(response.data);
});

app.post("/api/auth/google", async (req, res) => {
  const response = await axios.post(`${process.env.AUTH_SERVICE_URL}/auth/google`, req.body);
  res.json(response.data);
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`API Gateway running on ${PORT}`));
