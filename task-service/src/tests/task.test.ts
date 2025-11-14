/// <reference types="jest" />
import { Request, Response } from 'express';
import { getAllTasks, getTaskbyId, createTask, updateTask, deleteTask } from '../controllers/task.controller';
import Task from '../models/task.model';

jest.mock('../models/task.model');

function mockRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
}

describe('Task Controller CRUD Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  //GetAllTasks Tests
  describe('getAllTasks', () => {
    it('should return 200 and all tasks', async () => {
      const mockTasks = [
        { taskId: 'uuid-1', taskName: 'Task A', dueDate: '2025-12-12', category: 'Work', priority: 'High', userEmail: 'abc@email.com', description: '', isCompleted: false },
        { taskId: 'uuid-2', taskName: 'Task B', dueDate: '2025-11-11', category: 'Home', priority: 'Low', userEmail: 'def@email.com', description: '', isCompleted: false },
      ];

      (Task.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockTasks),
      });

      const req = {} as Request;
      const res = mockRes() as unknown as Response;

      await getAllTasks(req, res);

      expect((res.status as jest.Mock).mock.calls[0][0]).toBe(200);
      expect((res.json as jest.Mock).mock.calls[0][0]).toBe(mockTasks);
    });

    it('should return 500 on error', async () => {
      (Task.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockRejectedValue(new Error('DB error')),
      });

      const req = {} as Request;
      const res = mockRes() as unknown as Response;

      await getAllTasks(req, res);

      expect((res.status as jest.Mock).mock.calls[0][0]).toBe(500);
      expect((res.json as jest.Mock).mock.calls[0][0]).toEqual({ message: 'Server error' });
    });
  });

  //GetTaskById Tests
  describe('getTaskbyId', () => {
    it('should return task when found', async () => {
      const mockTask = { _id: 'uuid-1', taskName: 'Task A', priority: 'High', userEmail: 'a@b.com' };
      (Task.findOne as jest.Mock).mockResolvedValue(mockTask);

      const req = { params: { id: 'uuid-1' } } as unknown as Request;
      const res = mockRes() as unknown as Response;

      await getTaskbyId(req, res);

      expect((Task.findOne as jest.Mock).mock.calls[0][0]).toEqual({ _id: 'uuid-1' });
      expect((res.json as jest.Mock).mock.calls[0][0]).toBe(mockTask);
    });

    it('should return 404 when task not found', async () => {
      (Task.findOne as jest.Mock).mockResolvedValue(null);

      const req = { params: { id: 'missing' } } as unknown as Request;
      const res = mockRes() as unknown as Response;

      await getTaskbyId(req, res);

      expect((res.status as jest.Mock).mock.calls[0][0]).toBe(404);
      expect((res.json as jest.Mock).mock.calls[0][0]).toEqual({ message: 'Task not found' });
    });

    it('should return 500 on database error', async () => {
      (Task.findOne as jest.Mock).mockRejectedValue(new Error('DB error'));

      const req = { params: { id: 'uuid-1' } } as unknown as Request;
      const res = mockRes() as unknown as Response;

      await getTaskbyId(req, res);

      expect((res.status as jest.Mock).mock.calls[0][0]).toBe(500);
    });
  });

  //CreateTask Tests
  describe('createTask', () => {
    it('should create task and return 201', async () => {
      const taskData = {
        taskName: 'New Task',
        dueDate: '2025-12-25',
        priority: 'Medium',
        category: 'Work',
        userEmail: 'user@email.com',
        description: 'Test task',
      };

      const mockTask = { _id: 'uuid-new', ...taskData };
      const mockInstance = {
        save: jest.fn().mockResolvedValue(mockTask),
      };

      (Task as unknown as jest.Mock).mockImplementation(() => mockInstance);

      const req = { body: taskData } as unknown as Request;
      const res = mockRes() as unknown as Response;

      await createTask(req, res);

      expect((res.status as jest.Mock).mock.calls[0][0]).toBe(201);
    });

    it('should return 500 on save error', async () => {
      const mockInstance = {
        save: jest.fn().mockRejectedValue(new Error('Save failed')),
      };

      (Task as unknown as jest.Mock).mockImplementation(() => mockInstance);

      const req = { body: { taskName: 'Task', dueDate: '2025-12-25' } } as unknown as Request;
      const res = mockRes() as unknown as Response;

      await createTask(req, res);

      expect((res.status as jest.Mock).mock.calls[0][0]).toBe(500);
      expect((res.json as jest.Mock).mock.calls[0][0]).toEqual({ message: 'Server error' });
    });
  });

  //UpdateTasks Tests
  describe('updateTask', () => {
    it('should update task and return 200', async () => {
      const updateData = { taskName: 'Updated Task', priority: 'High' };
      const updatedTask = { _id: 'uuid-1', ...updateData };

      (Task.findByIdAndUpdate as jest.Mock).mockResolvedValue(updatedTask);

      const req = { params: { id: 'uuid-1' }, body: updateData } as unknown as Request;
      const res = mockRes() as unknown as Response;

      await updateTask(req, res);

      expect((Task.findByIdAndUpdate as jest.Mock).mock.calls[0][0]).toBe('uuid-1');
      expect((res.status as jest.Mock).mock.calls[0][0]).toBe(200);
      expect((res.json as jest.Mock).mock.calls[0][0]).toBe(updatedTask);
    });

    it('should return 404 when task not found', async () => {
      (Task.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

      const req = { params: { id: 'missing' }, body: { taskName: 'New' } } as unknown as Request;
      const res = mockRes() as unknown as Response;

      await updateTask(req, res);

      expect((res.status as jest.Mock).mock.calls[0][0]).toBe(404);
      expect((res.json as jest.Mock).mock.calls[0][0]).toEqual({ message: 'Task not found' });
    });

    it('should return 500 on error', async () => {
      (Task.findByIdAndUpdate as jest.Mock).mockRejectedValue(new Error('DB error'));

      const req = { params: { id: 'uuid-1' }, body: {} } as unknown as Request;
      const res = mockRes() as unknown as Response;

      await updateTask(req, res);

      expect((res.status as jest.Mock).mock.calls[0][0]).toBe(500);
    });
  });

  //DeleteTask Tests
  describe('deleteTask', () => {
    it('should delete task and return 200', async () => {
      const deletedTask = { _id: 'uuid-1', taskName: 'Task' };
      (Task.findByIdAndDelete as jest.Mock).mockResolvedValue(deletedTask);

      const req = { params: { id: 'uuid-1' } } as unknown as Request;
      const res = mockRes() as unknown as Response;

      await deleteTask(req, res);

      expect((Task.findByIdAndDelete as jest.Mock).mock.calls[0][0]).toBe('uuid-1');
      expect((res.status as jest.Mock).mock.calls[0][0]).toBe(200);
      expect((res.json as jest.Mock).mock.calls[0][0]).toEqual(
        expect.objectContaining({ message: 'Task deleted successfully', task: deletedTask })
      );
    });

    it('should return 404 when task not found', async () => {
      (Task.findByIdAndDelete as jest.Mock).mockResolvedValue(null);

      const req = { params: { id: 'missing' } } as unknown as Request;
      const res = mockRes() as unknown as Response;

      await deleteTask(req, res);

      expect((res.status as jest.Mock).mock.calls[0][0]).toBe(404);
      expect((res.json as jest.Mock).mock.calls[0][0]).toEqual({ message: 'Task not found' });
    });

    it('should return 500 on error', async () => {
      (Task.findByIdAndDelete as jest.Mock).mockRejectedValue(new Error('DB error'));

      const req = { params: { id: 'uuid-1' } } as unknown as Request;
      const res = mockRes() as unknown as Response;

      await deleteTask(req, res);

      expect((res.status as jest.Mock).mock.calls[0][0]).toBe(500);
    });
  });
});
