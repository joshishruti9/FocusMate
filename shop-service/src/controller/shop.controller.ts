// src/controllers/shop_controller.ts
import { Request, Response } from "express";
import axios from "axios";
import Item from "../models/item";

interface IUser {
  _id: string;
  username: string;
  coins: number;
  cosmetics: string[];
}

// 🟢 GET all items
export const getAllItems = async (req: Request, res: Response) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: "Error fetching items", error });
  }
};

// 🟢 GET item by ID
export const getItemById = async (req: Request, res: Response) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: "Error fetching item", error });
  }
};

// 🟢 POST create new item
export const createItem = async (req: Request, res: Response) => {
  try {
    const { name, price, imageUrl } = req.body;
    const newItem = new Item({ name, price, imageUrl });
    await newItem.save();
    res.status(201).json(newItem);
  } catch (error) {
    res.status(400).json({ message: "Error creating item", error });
  }
};

// 🟡 POST purchase (communicates with user-service)
export const purchaseItem = async (req: Request, res: Response) => {
  const { userId, itemId } = req.body;

  console.log("Hello", req.body)
  try {
    const item = await Item.findById(itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });

    // Fetch user data from user-service
    let userRes = await axios.get<any>(`http://localhost:4000/api/users/email/${userId}`);
    const user = userRes.data;

    console.log("Fetched user")

    if ((user.rewardPoints || 0) < item.price) {
      return res.status(400).json({ message: "Not enough coins" });
    }
    console.log("Sending purchase request")
    // Deduct rewardPoints and add purchased item to user
      userRes = await axios.post<any>(`http://localhost:4000/api/users/${user._id}/purchase`, {
      itemId: item._id,
      price: item.price,
      name: item.name,
      imageUrl: item.imageUrl,
    });
    const updatedUser = userRes.data.user || userRes.data;

    // Remove item from shop inventory if user's purchase was recorded successfully
    await Item.findByIdAndDelete(item._id);

    res.json({ message: 'Purchase successful!', user: updatedUser });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : err });
  }
};

