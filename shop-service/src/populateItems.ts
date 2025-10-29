import mongoose from "mongoose";
import Item from "./models/item";

const mongoUri = "mongodb://localhost:27017/focusmate_shop";

mongoose.connect(mongoUri)
  .then(async () => {
    console.log("✅ Connected to MongoDB");

    const items = [
      { name: "Dog with Hat", price: 100, imageUrl: "https://via.placeholder.com/150" },
      { name: "Silver Sword", price: 200, imageUrl: "https://via.placeholder.com/150" },
      { name: "Red Heart", price: 50, imageUrl: "https://via.placeholder.com/150" },
    ];

    await Item.deleteMany({}); // optional: clear old items
    await Item.insertMany(items);
    console.log("✅ Items inserted");

    process.exit(0);
  })
  .catch(err => console.error(err));
