import Task from '../models/task.model';
import CompletedTask from '../models/completedTask.model';

export interface CompleteResult {
  userEmail: string;
  points: number;
  completedTaskId?: string;
}

export async function completeTask(taskId: string): Promise<CompleteResult> {
  if (!taskId) throw new Error('taskId is required');

  // Find by the application-level taskId (not Mongo _id)
  const task = await Task.findOne({ taskId });
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

  // Delete by taskId
  await Task.findOneAndDelete({ taskId });

  return { userEmail: task.userEmail, points};
}
