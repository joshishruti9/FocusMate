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

// 🟢 GET all items
router.get("/", async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: "Error fetching items", error });
  }
});

// 🟢 GET item by ID
router.get("/:id", async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: "Error fetching item", error });
  }
});

// 🟢 POST create new item
router.post("/", async (req, res) => {
  try {
    const { name, price, imageUrl } = req.body;
    const newItem = new Item({ name, price, imageUrl });
    await newItem.save();
    res.status(201).json(newItem);
  } catch (error) {
    res.status(400).json({ message: "Error creating item", error });
  }
});

// 🟡 POST purchase (uses axios to contact user-service)
router.post("/purchase", async (req, res) => {
  const { userId, itemId } = req.body;

  try {
    const item = await Item.findById(itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });

    // Get user data from user-service
    const userRes = await axios.get<IUser>(`http://localhost:4001/users/${userId}`);
    const user = userRes.data;

    if (user.coins < item.price) {
      return res.status(400).json({ message: "Not enough coins" });
    }

    // Deduct coins and add cosmetic to user (would call user-service)
    await axios.post(`http://localhost:4001/users/${userId}/purchase`, {
      itemId: item._id,
      price: item.price,
    });

    res.json({ message: "Purchase successful!" });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : err });
  }
});

export default router;
