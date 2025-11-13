import { Request, Response } from 'express';
import { getAllTasks } from '../controllers/task.controller';
import Task from '../models/task.model';

jest.mock('../models/task.model');

describe('getAllTasks', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 200 and all tasks (mocked data)', async () => {
    const mockTasks = [
      { _id: '1', taskName: 'Task A',  dueDate: new Date('2025-12-12'), category:'Work', priority:'High', userEmail:'abc@email.com', description:'', isCompleted:false },
      { _id: '2', taskName: 'Task B', dueDate: new Date('2025-11-11'), category:'Home', priority:'Low', userEmail:'def@email.com', description:'', isCompleted:false  },
    ];

  
    (Task.find as jest.Mock).mockReturnValue({
      sort: jest.fn().mockResolvedValue(mockTasks),
    });

    await getAllTasks(req as Request, res as Response);

    expect(Task.find).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockTasks);
  });

  it('should return 500 on error', async () => {
    (Task.find as jest.Mock).mockReturnValue({
      sort: jest.fn().mockRejectedValue(new Error('DB error')),
    });

    await getAllTasks(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Server error' });
  });
});
