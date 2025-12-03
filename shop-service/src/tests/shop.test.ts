import request from "supertest";
import express from "express";
import router from "../routes/shop_routes";
import Item from "../models/item";
import axios from "axios";

// Mock Item model and axios
jest.mock("../models/item");
jest.mock("axios");

const app = express();
app.use(express.json());
app.use("/shop", router);

describe("Shop Service API Tests", () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  // -------------------------------
  // GET /shop (getAllItems)
  // -------------------------------
  test("GET /shop should return all items", async () => {
    (Item.find as jest.Mock).mockResolvedValue([
      { _id: "1", name: "Sword", price: 100, imageUrl: "" },
    ]);

    const res = await request(app).get("/shop");

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(Item.find).toHaveBeenCalled();
  });

  test("GET /shop should return 500 if DB fails", async () => {
    (Item.find as jest.Mock).mockRejectedValue(new Error("DB error"));

    const res = await request(app).get("/shop");

    expect(res.status).toBe(500);
  });

  // -------------------------------
  // GET /shop/:id (getItemById)
  // -------------------------------
  test("GET /shop/:id returns item if found", async () => {
    (Item.findById as jest.Mock).mockResolvedValue({
      _id: "123",
      name: "Helmet",
      price: 50,
    });

    const res = await request(app).get("/shop/123");

    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Helmet");
  });

  test("GET /shop/:id returns 404 if item missing", async () => {
    (Item.findById as jest.Mock).mockResolvedValue(null);

    const res = await request(app).get("/shop/doesnotexist");

    expect(res.status).toBe(404);
  });

  test("GET /shop/:id returns 500 on DB error", async () => {
    (Item.findById as jest.Mock).mockRejectedValue(new Error("DB error"));

    const res = await request(app).get("/shop/1");

    expect(res.status).toBe(500);
  });

  // -------------------------------
  // POST /shop/purchase
  // -------------------------------
  test("POST /shop/purchase success", async () => {
    // Mock database item lookup
    (Item.findById as jest.Mock).mockResolvedValue({
      _id: "item123",
      name: "Shield",
      price: 100,
    });

    // Mock user-service GET
    (axios.get as jest.Mock).mockResolvedValue({
      data: { _id: "user1", coins: 200, cosmetics: [] },
    });

    // Mock user-service POST purchase
    (axios.post as jest.Mock).mockResolvedValue({ data: { ok: true } });

    const res = await request(app)
      .post("/shop/purchase")
      .send({ userId: "user1", itemId: "item123" });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Purchase successful!");
  });

  test("POST /shop/purchase fails when item not found", async () => {
    (Item.findById as jest.Mock).mockResolvedValue(null);

    const res = await request(app)
      .post("/shop/purchase")
      .send({ userId: "user1", itemId: "baditem" });

    expect(res.status).toBe(404);
  });

  test("POST /shop/purchase fails if user has insufficient coins", async () => {
    (Item.findById as jest.Mock).mockResolvedValue({
      _id: "i1",
      name: "Shield",
      price: 200,
    });

    (axios.get as jest.Mock).mockResolvedValue({
      data: { _id: "u1", coins: 50, cosmetics: [] },
    });

    const res = await request(app)
      .post("/shop/purchase")
      .send({ userId: "u1", itemId: "i1" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Not enough coins");
  });

  test("POST /shop/purchase returns 500 on axios/microservice error", async () => {
    (Item.findById as jest.Mock).mockResolvedValue({
      _id: "i1",
      price: 50,
    });

    (axios.get as jest.Mock).mockRejectedValue(new Error("User service down"));

    const res = await request(app)
      .post("/shop/purchase")
      .send({ userId: "u1", itemId: "i1" });

    expect(res.status).toBe(500);
  });
});
