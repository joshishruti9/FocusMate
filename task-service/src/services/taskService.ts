import Task from '../models/task.model';
import CompletedTask from '../models/completedTask.model';

export interface CompleteResult {
  userEmail: string;
  points: number;
  completedTaskId?: string;
}

export async function completeTask(_id: string): Promise<CompleteResult> {
  if (!_id) throw new Error('taskId is required');

  const task = await Task.findById({ _id });
  if (!task) throw new Error('Task not found');

  const priority = (task.priority || 'Low').toLowerCase();
  const pointsMap: Record<string, number> = { low: 10, medium: 30, high: 50 };
  const points = pointsMap[priority] ?? 10;

  const completed = new CompletedTask({
    userEmail: task.userEmail,
    taskName: task.taskName,
    dueDate: task.dueDate,
    category: task.category,
    priority: task.priority,
    description: task.description,
    isCompleted: true,
    rewardPoints: points,
    completedAt: new Date(),
  });

  const saved = await completed.save();

  await Task.findByIdAndDelete({ _id });

  return { userEmail: task.userEmail, points};
}
