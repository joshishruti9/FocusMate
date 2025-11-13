/// <reference types="jest" />
import { Request, Response } from 'express';
import { getAllUsers, getUserbyId, createUser, updateUser, deleteUser, addReward } from '../controllers/user.controller';
import User from '../models/user.model';

jest.mock('../models/user.model');

function mockRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
}

//GetUsers Tests

describe('User Controller CRUD Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllUsers', () => {
    it('should return 200 and all users', async () => {
      const mockUsers = [
        { _id: 'user-1', userEmail: 'user1@example.com', firstName: 'John', lastName: 'Doe', rewardPoints: 100 },
        { _id: 'user-2', userEmail: 'user2@example.com', firstName: 'Jane', lastName: 'Smith', rewardPoints: 50 },
      ];

      (User.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockUsers),
      });

      const req = {} as Request;
      const res = mockRes() as unknown as Response;

      await getAllUsers(req, res);

      expect((res.status as jest.Mock).mock.calls[0][0]).toBe(200);
      expect((res.json as jest.Mock).mock.calls[0][0]).toBe(mockUsers);
    });

    it('should return 500 on error', async () => {
      (User.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockRejectedValue(new Error('DB error')),
      });

      const req = {} as Request;
      const res = mockRes() as unknown as Response;

      await getAllUsers(req, res);

      expect((res.status as jest.Mock).mock.calls[0][0]).toBe(500);
      expect((res.json as jest.Mock).mock.calls[0][0]).toEqual({ message: 'Server error' });
    });
  });

  //GetUserById Tests

  describe('getUserbyId', () => {
    it('should return user when found', async () => {
      const mockUser = { _id: 'user-1', userEmail: 'user@example.com', firstName: 'John', rewardPoints: 100 };
      
      (User.findById as jest.Mock).mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockUser),
      });

      const req = { params: { id: 'user-1' } } as unknown as Request;
      const res = mockRes() as unknown as Response;

      await getUserbyId(req, res);

      expect((User.findById as jest.Mock).mock.calls[0][0]).toBe('user-1');
      expect((res.json as jest.Mock).mock.calls[0][0]).toBe(mockUser);
    });

    it('should return 500 on database error', async () => {
      (User.findById as jest.Mock).mockReturnValue({
        sort: jest.fn().mockRejectedValue(new Error('DB error')),
      });

      const req = { params: { id: 'user-1' } } as unknown as Request;
      const res = mockRes() as unknown as Response;

      await getUserbyId(req, res);

      expect((res.status as jest.Mock).mock.calls[0][0]).toBe(500);
    });
  });

    //CreateUser Tests

  describe('createUser', () => {
    it('should create user and return 201', async () => {
      const userData = {
        userEmail: 'newuser@example.com',
        firstName: 'Alice',
        lastName: 'Johnson',
        password: 'secure123',
        rewardPoints: 0,
      };

      const mockUser = { _id: 'new-user', ...userData };
      const mockInstance = {
        save: jest.fn().mockResolvedValue(mockUser),
      };

      (User as unknown as jest.Mock).mockImplementation(() => mockInstance);

      const req = { body: userData } as unknown as Request;
      const res = mockRes() as unknown as Response;

      await createUser(req, res);

      expect((res.status as jest.Mock).mock.calls[0][0]).toBe(201);
    });

    it('should return 500 on save error', async () => {
      const mockInstance = {
        save: jest.fn().mockRejectedValue(new Error('Save failed')),
      };

      (User as unknown as jest.Mock).mockImplementation(() => mockInstance);

      const req = { body: { userEmail: 'user@example.com' } } as unknown as Request;
      const res = mockRes() as unknown as Response;

      await createUser(req, res);

      expect((res.status as jest.Mock).mock.calls[0][0]).toBe(500);
      expect((res.json as jest.Mock).mock.calls[0][0]).toEqual({ message: 'Server error' });
    });
  });

  //UpdateUser Tests
  describe('updateUser', () => {
    it('should update user and return 200', async () => {
      const updateData = { firstName: 'Johnny', rewardPoints: 150 };
      const updatedUser = { _id: 'user-1', userEmail: 'user@example.com', ...updateData };

      (User.findByIdAndUpdate as jest.Mock).mockResolvedValue(updatedUser);

      const req = { params: { id: 'user-1' }, body: updateData } as unknown as Request;
      const res = mockRes() as unknown as Response;

      await updateUser(req, res);

      expect((User.findByIdAndUpdate as jest.Mock).mock.calls[0][0]).toBe('user-1');
      expect((res.status as jest.Mock).mock.calls[0][0]).toBe(200);
      expect((res.json as jest.Mock).mock.calls[0][0]).toBe(updatedUser);
    });

    it('should return 404 when user not found', async () => {
      (User.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

      const req = { params: { id: 'missing' }, body: { firstName: 'New' } } as unknown as Request;
      const res = mockRes() as unknown as Response;

      await updateUser(req, res);

      expect((res.status as jest.Mock).mock.calls[0][0]).toBe(404);
      expect((res.json as jest.Mock).mock.calls[0][0]).toEqual({ message: 'User not found' });
    });

    it('should return 500 on error', async () => {
      (User.findByIdAndUpdate as jest.Mock).mockRejectedValue(new Error('DB error'));

      const req = { params: { id: 'user-1' }, body: {} } as unknown as Request;
      const res = mockRes() as unknown as Response;

      await updateUser(req, res);

      expect((res.status as jest.Mock).mock.calls[0][0]).toBe(500);
    });
  });

  //DeleteUser Tests
  describe('deleteUser', () => {
    it('should delete user and return 200', async () => {
      const deletedUser = { _id: 'user-1', userEmail: 'user@example.com' };
      (User.findByIdAndDelete as jest.Mock).mockResolvedValue(deletedUser);

      const req = { params: { id: 'user-1' } } as unknown as Request;
      const res = mockRes() as unknown as Response;

      await deleteUser(req, res);

      expect((User.findByIdAndDelete as jest.Mock).mock.calls[0][0]).toBe('user-1');
      expect((res.status as jest.Mock).mock.calls[0][0]).toBe(200);
      expect((res.json as jest.Mock).mock.calls[0][0]).toEqual(
        expect.objectContaining({ message: 'User deleted successfully', user: deletedUser })
      );
    });

    it('should return 404 when user not found', async () => {
      (User.findByIdAndDelete as jest.Mock).mockResolvedValue(null);

      const req = { params: { id: 'missing' } } as unknown as Request;
      const res = mockRes() as unknown as Response;

      await deleteUser(req, res);

      expect((res.status as jest.Mock).mock.calls[0][0]).toBe(404);
      expect((res.json as jest.Mock).mock.calls[0][0]).toEqual({ message: 'User not found' });
    });

    it('should return 500 on error', async () => {
      (User.findByIdAndDelete as jest.Mock).mockRejectedValue(new Error('DB error'));

      const req = { params: { id: 'user-1' } } as unknown as Request;
      const res = mockRes() as unknown as Response;

      await deleteUser(req, res);

      expect((res.status as jest.Mock).mock.calls[0][0]).toBe(500);
    });
  });

  //AddReward Tests
  describe('addReward', () => {
    it('should add reward points to user', async () => {
      const userMock = { userEmail: 'user@example.com', rewardPoints: 50, save: jest.fn().mockResolvedValue(undefined) };
      (User.findOne as jest.Mock).mockResolvedValue(userMock);

      const req = { body: { userEmail: 'user@example.com', points: 30 } } as unknown as Request;
      const res = mockRes() as unknown as Response;

      await addReward(req, res);

      expect((User.findOne as jest.Mock).mock.calls[0][0]).toEqual({ userEmail: 'user@example.com' });
      expect(userMock.save).toHaveBeenCalled();
    });

    it('should return 400 when missing userEmail or points', async () => {
      const req = { body: { userEmail: 'user@example.com' } } as unknown as Request;
      const res = mockRes() as unknown as Response;

      await addReward(req, res);

      expect((res.status as jest.Mock).mock.calls[0][0]).toBe(400);
      expect((res.json as jest.Mock).mock.calls[0][0]).toEqual({ message: 'userEmail and numeric points are required' });
    });

    it('should return 404 when user not found', async () => {
      (User.findOne as jest.Mock).mockResolvedValue(null);

      const req = { body: { userEmail: 'missing@example.com', points: 20 } } as unknown as Request;
      const res = mockRes() as unknown as Response;

      await addReward(req, res);

      expect((res.status as jest.Mock).mock.calls[0][0]).toBe(404);
      expect((res.json as jest.Mock).mock.calls[0][0]).toEqual({ message: 'User not found' });
    });

    it('should return 500 on error', async () => {
      (User.findOne as jest.Mock).mockRejectedValue(new Error('DB error'));

      const req = { body: { userEmail: 'user@example.com', points: 20 } } as unknown as Request;
      const res = mockRes() as unknown as Response;

      await addReward(req, res);

      expect((res.status as jest.Mock).mock.calls[0][0]).toBe(500);
    });
  });
});
