import mongoose from "mongoose";
import Item from "./models/item";

const mongoUri = "mongodb://localhost:27017/focusmate";

mongoose.connect(mongoUri)
  .then(async () => {
    console.log("✅ Connected to MongoDB");

    const items = [
      { name: "Dog with Hat", price: 100, imageUrl: "https://static.vecteezy.com/system/resources/previews/027/616/206/non_2x/dog-wearing-bucket-hat-vintage-logo-line-art-concept-black-and-white-color-hand-drawn-illustration-vector.jpg" },
      { name: "Silver Sword", price: 200, imageUrl: "https://static.vecteezy.com/system/resources/previews/057/282/475/non_2x/a-black-and-silver-sword-with-a-white-background-vector.jpg" },
      { name: "Red Heart", price: 50, imageUrl: "https://p7.hiclipart.com/preview/191/9/299/8-bit-color-clip-art-pixel-art-thumbnail.jpg" },
    ];

    await Item.deleteMany({}); // optional: clear old items
    await Item.insertMany(items);
    console.log("✅ Items inserted");

    process.exit(0);
  })
  .catch(err => console.error(err));
