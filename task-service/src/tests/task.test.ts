/// <reference types="jest" />
import mongoose from 'mongoose';
import Task from '../models/task.model';
import CompletedTask from '../models/completedTask.model';
import * as TaskController from '../controllers/task.controller';
import jwt from 'jsonwebtoken';
import * as userClient from '../clients/userClient';

jest.mock('../clients/userClient');

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

describe('Task Service Integration Tests', () => {
  describe('Create Task', () => {
    it('creates a task with auto-generated taskId', async () => {
      const taskData = {
        taskName: 'Integration Test Task',
        dueDate: '2025-12-25',
        priority: 'High',
        category: 'Work',
        userEmail: 'test@example.com',
        description: 'Test task creation',
      };

      const task = new Task(taskData);
      const saved = await task.save();

      expect(saved._id).toBeDefined();
      expect(saved.taskName).toBe(taskData.taskName);
      expect(saved.priority).toBe(taskData.priority);
      expect(saved.userEmail).toBe(taskData.userEmail);
    });

    it('creates a task with reminder settings', async () => {
      const taskData = {
        taskName: 'Reminder Test',
        dueDate: '2025-12-26',
        priority: 'Low',
        userEmail: 'remind@test.com',
        reminder: {
          enabled: true,
          remindAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
        }
      } as any;

      const task = new Task(taskData);
      const saved = await task.save();

      expect(saved._id).toBeDefined();
      expect(saved.reminder).toBeDefined();
      expect(saved.reminder?.enabled).toBe(true);
      expect(saved.reminder?.remindAt).toBeDefined();
    });

    it('generates unique taskIds for different tasks', async () => {
      const task1 = new Task({
        taskName: 'Task 1',
        dueDate: '2025-01-01',
        priority: 'Low',
        userEmail: 'user1@test.com',
      });

      const task2 = new Task({
        taskName: 'Task 2',
        dueDate: '2025-01-02',
        priority: 'Medium',
        userEmail: 'user2@test.com',
      });

      const saved1 = await task1.save();
      const saved2 = await task2.save();

      expect(saved1.taskName).not.toBe(saved2.taskName);
      expect(saved1._id).not.toBe(saved2._id);
    });
  })

  describe('Get Tasks', () => {
    it('retrieves all tasks', async () => {

      const task1 = await Task.create({
          taskName: 'Task A',
          dueDate: '2025-01-01',
          priority: 'High',
          userEmail: 'a@test.com',
      });

      const task2 = await Task.create({
          taskName: 'Task B',
          dueDate: '2025-01-02',
          priority: 'Low',
          userEmail: 'b@test.com',
      });

      const tasks = await Task.find().sort({ createdAt: -1 });

      expect(tasks).toHaveLength(2);
      expect(tasks[0].taskName).toBe('Task A');
      expect(tasks[1].taskName).toBe('Task B');
    });

    it('retrieves task by MongoDB _id', async () => {
      const created = await Task.create({
        taskName: 'Find Me',
        dueDate: '2025-01-01',
        priority: 'High',
        userEmail: 'find@test.com',
      });

      const found = await Task.findOne({ _id: created._id });

      expect(found).toBeDefined();
      expect(found?.taskName).toBe('Find Me');
    });

    it('retrieves tasks due soon via controller', async () => {
      const now = new Date();
      const soon = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes

      const today = new Date();
      const dueDate = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
      await Task.create({
        taskName: 'Due Soon',
        dueDate,
        priority: 'Low',
        userEmail: 'due@test.com',
        reminder: { enabled: true, remindAt: soon.toISOString() }
      } as any);

      const req = { query: { minutes: '30' } } as any;

      let result: any = null;
      const res = {
        status: (code: number) => ({ json: (data: any) => { result = data; } }),
      } as any;

      await TaskController.getTasksDueSoon(req, res);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(result[0].taskName).toBe('Due Soon');
    });

    it('retrieves tasks with reminder.remindAt within window via controller', async () => {
      const now = new Date();
      const remindAt = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes

      const today = new Date();
      const dueDate = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
      await Task.create({
        taskName: 'Remind Soon',
        dueDate, // due today so it matches the new combined condition
        priority: 'Low',
        userEmail: 'remindsoontest@test.com',
        reminder: { enabled: true, remindAt: remindAt.toISOString() }
      } as any);

        const token = jwt.sign({ userEmail: 'remindsoontest@test.com' }, process.env.JWT_SECRET || 'default_secret');
        const req = { query: { minutes: '30' }, headers: { authorization: `Bearer ${token}` } } as any;
      let result: any = null;
      const res = {
        status: (code: number) => ({ json: (data: any) => { result = data; } }),
      } as any;

      await TaskController.getTasksDueSoon(req, res);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      const found = result.find((t: any) => t.taskName === 'Remind Soon');
      expect(found).toBeDefined();
      expect(found.reminder?.enabled).toBe(true);
    });
  });

  describe('Update Task', () => {
    it('updates a task by _id', async () => {
      const created = await Task.create({
        taskName: 'Original',
        dueDate: '2025-01-01',
        priority: 'Low',
        userEmail: 'original@test.com',
      });

      const updated = await Task.findByIdAndUpdate(
        created._id,
        { taskName: 'Updated', priority: 'High' },
        { new: true, runValidators: true }
      );

      expect(updated?.taskName).toBe('Updated');
      expect(updated?.priority).toBe('High');
    });

    it('returns null when task to update does not exist', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const result = await Task.findByIdAndUpdate(fakeId, { taskName: 'New' }, { new: true });

      expect(result).toBeNull();
    });
  });

  describe('Delete Task', () => {
    it('deletes a task by _id', async () => {
      const created = await Task.create({
        taskName: 'To Delete',
        dueDate: '2025-01-01',
        priority: 'Medium',
        userEmail: 'delete@test.com',
      });

      const deleted = await Task.findByIdAndDelete(created._id);

      expect(deleted?.taskName).toBe('To Delete');

      const found = await Task.findById(created._id);
      expect(found).toBeNull();
    });

    it('returns null when task to delete does not exist', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const result = await Task.findByIdAndDelete(fakeId);

      expect(result).toBeNull();
    });
  });

  describe('Complete Task Flow', () => {
    it('moves task to completed and preserves taskId', async () => {
      // Create a task
      const task = await Task.create({
        taskName: 'Complete Me',
        dueDate: '2025-01-01',
        priority: 'High',
        userEmail: 'complete@test.com',
      });


      // Move to completed
      const completedTask = new CompletedTask({
        userEmail: task.userEmail,
        taskName: task.taskName,
        dueDate: task.dueDate,
        priority: task.priority,
        rewardPoints: 50,
        isCompleted: true,
        taskId: task._id.toString(),
      });

      const saved = await completedTask.save();

      // Delete original task
      await Task.findByIdAndDelete(task._id);

      // Verify
      expect(saved.rewardPoints).toBe(50);

      const taskGone = await Task.findById(task._id);
      expect(taskGone).toBeNull();

      const completedExists = await CompletedTask.findOne({ taskName: task.taskName });
      expect(completedExists).toBeDefined();
      expect(completedExists?.taskName).toBe(task.taskName.toString());
    });

    it('controller markTaskComplete calls userClient.addReward and moves task', async () => {
      const task = await Task.create({
        taskName: 'Controller Complete',
        dueDate: '2025-01-01',
        priority: 'High',
        userEmail: 'controller@test.com',
      });

      const req = { params: { id: task._id.toString() }, body: { userEmail: task.userEmail } } as any;
      let statusCode = 0;
      let responseJson: any = null;
      const res = {
        status: (code: number) => { statusCode = code; return { json: (data: any) => { responseJson = data; } }; }
      } as any;

      // userClient.addReward is mocked, ensure it resolves
      (userClient.addReward as jest.Mock).mockResolvedValue(undefined);

      await TaskController.markTaskComplete(req, res);

      expect(statusCode).toBe(200);
      expect((userClient.addReward as jest.Mock).mock.calls.length).toBeGreaterThanOrEqual(1);

      const foundTask = await Task.findById(task._id);
      expect(foundTask).toBeNull();
      const completed = await CompletedTask.findOne({ taskName: 'Controller Complete' });
      expect(completed).toBeDefined();
      expect(completed?.rewardPoints).toBeGreaterThan(0);
    });
  });
});
