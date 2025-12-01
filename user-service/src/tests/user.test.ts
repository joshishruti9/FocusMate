import mongoose from 'mongoose';
import express, { request } from 'express';
import bodyParser from 'body-parser';
import userRoutes from '../routes/user.routes';
import User from '../models/user.model';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod: MongoMemoryServer;
const app = express();
app.use(bodyParser.json());
app.use('/api/users', userRoutes);

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

beforeEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

describe('User Service API', () => {
  it('addReward increments rewardPoints correctly', async () => {
    const u = new User({ userEmail: 'test@example.com', firstName: 'Test', lastName: 'User', password: 'pwd' });
    await u.save();

    const res = await request(app)
      .post('/api/users/rewards')
      .send({ userEmail: 'test@example.com', points: 25 });

    expect(res.status).toBe(200);
    expect(res.body.rewardPoints).toBe(25);

    const found = await User.findOne({ userEmail: 'test@example.com' });
    expect(found?.rewardPoints).toBe(25);
  });

  it('purchaseItemForUser deducts rewardPoints and appends to purchasedItems', async () => {
    const u = new User({ userEmail: 'buy@example.com', firstName: 'Buyer', lastName: 'User', password: 'pwd', rewardPoints: 150 });
    const saved = await u.save();

    const res = await request(app)
      .post(`/api/users/${saved._id}/purchase`)
      .send({ itemId: 'abc123', price: 100, name: 'Sword', imageUrl: 'http://example.com/sword.png' });

    expect(res.status).toBe(200);
    const updated = await User.findById(saved._id);
    expect(updated?.rewardPoints).toBe(50);
    expect(updated?.purchasedItems?.length).toBe(1);
    expect(updated?.purchasedItems?.[0].itemId).toBe('abc123');
  });
});

