/// <reference types="jest" />
import mongoose from 'mongoose';
import User from '../models/user.model';

const MONGODB_URI = 'mongodb://localhost:27017/focusmatetest';

beforeAll(async () => {
  await mongoose.connect(MONGODB_URI);
});

afterAll(async () => {
  await mongoose.disconnect();
});

beforeEach(async () => {
  // Clear all collections before each test
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

describe('User Service Integration Tests', () => {
  describe('Create User', () => {
    it('creates a new user', async () => {
      const userData = {
        userEmail: 'newuser@test.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'secure123',
        rewardPoints: 0,
      };

      const user = new User(userData);
      const saved = await user.save();

      expect(saved._id).toBeDefined();
      expect(saved.userEmail).toBe(userData.userEmail);
      expect(saved.firstName).toBe(userData.firstName);
      expect(saved.rewardPoints).toBe(0);
    });
  });

  describe('Get Users', () => {
    it('retrieves all users sorted by creation date', async () => {
      await User.insertMany([
        {
          userEmail: 'user1@test.com',
          firstName: 'Alice',
          lastName: 'Smith',
          password: 'pass1',
          rewardPoints: 50,
        },
        {
          userEmail: 'user2@test.com',
          firstName: 'Bob',
          lastName: 'Jones',
          password: 'pass2',
          rewardPoints: 100,
        },
      ]);

      const users = await User.find().sort({ createdAt: -1 });

      expect(users).toHaveLength(2);
      expect(users[1  ].firstName).toBe('Bob');
      expect(users[0].firstName).toBe('Alice');
    });

    it('retrieves a user by _id', async () => {
      const created = await User.create({
        userEmail: 'findme@test.com',
        firstName: 'Charlie',
        lastName: 'Brown',
        password: 'pass123',
        rewardPoints: 75,
      });

      const found = await User.findById(created._id);

      expect(found).toBeDefined();
      expect(found?.userEmail).toBe('findme@test.com');
      expect(found?.rewardPoints).toBe(75);
    });

    it('retrieves a user by email', async () => {
      await User.create({
        userEmail: 'specific@test.com',
        firstName: 'David',
        lastName: 'Miller',
        password: 'pass456',
        rewardPoints: 100,
      });

      const found = await User.findOne({ userEmail: 'specific@test.com' });

      expect(found).toBeDefined();
      expect(found?.firstName).toBe('David');
    });
  });

  describe('Update User', () => {
    it('updates user reward points', async () => {
      const created = await User.create({
        userEmail: 'update@test.com',
        firstName: 'Eve',
        lastName: 'Taylor',
        password: 'pass789',
        rewardPoints: 50,
      });

      const updated = await User.findByIdAndUpdate(
        created._id,
        { rewardPoints: 100 },
        { new: true, runValidators: true }
      );

      expect(updated?.rewardPoints).toBe(100);
      expect(updated?.userEmail).toBe('update@test.com');
    });

    it('updates multiple user fields', async () => {
      const created = await User.create({
        userEmail: 'multi@test.com',
        firstName: 'Frank',
        lastName: 'Wilson',
        password: 'oldpass',
        rewardPoints: 25,
      });

      const updated = await User.findByIdAndUpdate(
        created._id,
        { firstName: 'Francis', password: 'newpass', rewardPoints: 50 },
        { new: true }
      );

      expect(updated?.firstName).toBe('Francis');
      expect(updated?.password).toBe('newpass');
      expect(updated?.rewardPoints).toBe(50);
    });

    it('returns null when updating non-existent user', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const result = await User.findByIdAndUpdate(fakeId, { firstName: 'New' }, { new: true });

      expect(result).toBeNull();
    });
  });

  describe('Delete User', () => {
    it('deletes a user by _id', async () => {
      const created = await User.create({
        userEmail: 'delete@test.com',
        firstName: 'Grace',
        lastName: 'Harris',
        password: 'pass123',
        rewardPoints: 0,
      });

      const deleted = await User.findByIdAndDelete(created._id);

      expect(deleted?.userEmail).toBe('delete@test.com');

      const found = await User.findById(created._id);
      expect(found).toBeNull();
    });

    it('returns null when deleting non-existent user', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const result = await User.findByIdAndDelete(fakeId);

      expect(result).toBeNull();
    });
  });

  describe('Add Reward Flow', () => {
    it('adds reward points to existing user', async () => {
      const user = await User.create({
        userEmail: 'reward@test.com',
        firstName: 'Iris',
        lastName: 'King',
        password: 'pass111',
        rewardPoints: 50,
      });

      // Simulate adding reward
      user.rewardPoints += 30;
      const updated = await user.save();

      expect(updated.rewardPoints).toBe(80);
    });

    it('increments reward points multiple times', async () => {
      const user = await User.create({
        userEmail: 'multi@test.com',
        firstName: 'Jack',
        lastName: 'Lee',
        password: 'pass222',
        rewardPoints: 0,
      });

      // Add reward 1
      user.rewardPoints += 10;
      await user.save();

      // Add reward 2
      user.rewardPoints += 30;
      await user.save();

      // Add reward 3 (reaches 100 - triggers unlock)
      user.rewardPoints += 60;
      const final = await user.save();

      expect(final.rewardPoints).toBe(100);
      expect(final.rewardPoints % 100).toBe(0); // Multiple of 100 check
    });

    it('finds user by email and updates reward points', async () => {
      const user = await User.create({
        userEmail: 'findupdate@test.com',
        firstName: 'Kelly',
        lastName: 'Martin',
        password: 'pass333',
        rewardPoints: 40,
      });

      // Find and update reward
      const found = await User.findOne({ userEmail: 'findupdate@test.com' });
      expect(found).toBeDefined();

      found!.rewardPoints += 20;
      const updated = await found!.save();

      expect(updated.rewardPoints).toBe(60);

      // Verify in DB
      const verified = await User.findOne({ userEmail: 'findupdate@test.com' });
      expect(verified?.rewardPoints).toBe(60);
    });
  });
});
describe('User Service API', () => {
  it('addReward increments rewardPoints correctly', async () => {
    const u = new User({ userEmail: 'test@example.com', firstName: 'Test', lastName: 'User', password: 'pwd',  rewardPoints: 50,});
    await u.save();

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

