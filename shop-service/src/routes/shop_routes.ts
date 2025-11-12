// src/routes/shop_routes.ts
import express from "express";
import {
  getAllItems,
  getItemById,
  createItem,
  purchaseItem,
} from "../controller/shop.controller";

const router = express.Router();

// Route mappings
router.get("/", getAllItems);
router.get("/:id", getItemById);
router.post("/purchase", purchaseItem);

export default router;
