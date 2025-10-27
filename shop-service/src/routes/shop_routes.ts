import express from "express";
import axios from "axios";
import Item from "../models/item";

interface IUser {
  _id: string;
  username: string;
  coins: number;
  cosmetics: string[];
}

const router = express.Router();

router.get("/", async (req, res) => {
  const items = await Item.find();
  res.json(items);
});

router.post("/purchase", async (req, res) => {
  const { userId, itemId } = req.body;

  try {
    const item = await Item.findById(itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });

    // Get user data from user-service
    const userRes = await axios.get<IUser>(`http://localhost:4001/users/${userId}`);
    const user = userRes.data;

    if (user.coins < item.price)
      return res.status(400).json({ message: "Not enough coins" });

    // Deduct coins and add cosmetic to user
    await axios.post(`http://user-service:3002/users/${userId}/purchase`, {
      itemId: item._id,
      price: item.price,
    });

    res.json({ message: "Purchase successful!" });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : err });
  }
});

export default router;
