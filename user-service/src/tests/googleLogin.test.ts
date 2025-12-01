/// <reference types="jest" />
import mongoose from 'mongoose';
import User from '../models/user.model';
import { googleLogin } from '../controllers/user.controller';
import axios from 'axios';
import { OAuth2Client } from 'google-auth-library';

jest.mock('axios');
jest.mock('google-auth-library');
const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedOAuth2 = OAuth2Client as unknown as jest.MockedClass<typeof OAuth2Client>;

const MONGODB_URI = 'mongodb://localhost:27017/focusmatetest';

beforeAll(async () => {
  await mongoose.connect(MONGODB_URI);
});

afterAll(async () => {
  await mongoose.disconnect();
});

beforeEach(async () => {
  jest.resetAllMocks();
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

it('should create user on first google login and return tasks', async () => {
  const fakeToken = 'FAKE_TOKEN';
  const tokenData = {
    email: 'googleuser@example.com',
    given_name: 'Google',
    family_name: 'User',
    email_verified: 'true'
  };

  mockedAxios.get.mockImplementation(url => {
    if ((url as string).includes('tokeninfo')) {
      return Promise.resolve({ status: 200, data: tokenData });
    }
    if ((url as string).includes('/api/tasks')) {
      return Promise.resolve({ status: 200, data: [{ taskName: 'Task A', userEmail: 'googleuser@example.com' }] });
    }
    if ((url as string).includes('/api/tasks/completed/summary')) {
      return Promise.resolve({ status: 200, data: { totalEarned: 70 } });
    }
    return Promise.resolve({ status: 200, data: {} });
  });

  // Mock OAuth2Client.verifyIdToken to return payload with email claims
  const mockVerify = jest.fn().mockResolvedValue({ getPayload: () => tokenData });
  mockedOAuth2.prototype.verifyIdToken = mockVerify;

  const req: any = { body: { idToken: fakeToken } };
  let jsonResult: any = null;
  const res: any = {
    status: (code: number) => ({ json: (data: any) => { jsonResult = { code, data }; } })
  };

  await googleLogin(req, res);

  expect(jsonResult).toBeDefined();
  expect(jsonResult.code).toBe(200);
  expect(jsonResult.data.user.userEmail).toBe('googleuser@example.com');
  expect(jsonResult.data.user.rewardPoints).toBe(70);
  expect(Array.isArray(jsonResult.data.tasks)).toBe(true);
  expect(jsonResult.data.tasks[0].taskName).toBe('Task A');
});
