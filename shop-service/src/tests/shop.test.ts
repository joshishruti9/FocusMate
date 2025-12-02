import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Item from '../models/item';
import * as ShopController from '../controller/shop.controller';
import * as httpMocks from 'node-mocks-http';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

let mongod: MongoMemoryServer;
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
  for (const key in collections) await collections[key].deleteMany({});
  mockedAxios.get.mockReset();
  mockedAxios.post.mockReset();
});

describe('Shop Service purchase flow', () => {
  it('deletes item after successful purchase and calls user-service', async () => {
    const item = await Item.create({ name: 'Test Item', price: 120, imageUrl: 'http://example.com' });

    // Mock user-service GET by id to return a user with enough points
    mockedAxios.get.mockResolvedValue({ data: { _id: 'u1', userEmail: 'u@test.com', rewardPoints: 200 } });
    mockedAxios.post.mockResolvedValue({ data: { message: 'Purchase recorded', user: { _id: 'u1', rewardPoints: 80 } } });

    const req = httpMocks.createRequest({ method: 'POST', body: { userId: 'u1', itemId: item._id } });
    const res = httpMocks.createResponse();

    await ShopController.purchaseItem(req as any, res as any);
    const json = res._getJSONData();
    expect(json.message).toBe('Purchase successful!');
    expect(json.user).toBeDefined();

    // check that item was deleted from DB
    const found = await Item.findById(item._id);
    expect(found).toBeNull();
    expect(mockedAxios.post).toHaveBeenCalled();
  });
});
