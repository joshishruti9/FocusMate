import axios from 'axios';
import { CronJob } from 'cron';
import EmailClient from '../transport/emailClient';
import { Request, Response } from 'express';

class NotificationService {
  private static instance: NotificationService | null = null;
  private job?: CronJob;

  static getInstance() {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  start() {
    // Cron every minute for demo; this can be controlled via environment
    if (process.env.NODE_ENV === 'test') {
      // don't start cron in test environment
      return;
    }
    this.job = new CronJob('*/1 * * * *', async () => {
      await this.checkAndNotify();
    });
    this.job.start();
  }

  stop() {
    this.job?.stop();
  }

  async checkAndNotify() {
    try {
      // Ask task-service for tasks due in next 15 minutes
      const tasksResp = await axios.get('http://localhost:5000/api/tasks/due-soon');
      const tasksData = tasksResp.data;
      
      const tasks = Array.isArray(tasksData) ? tasksData : tasksData?.tasks || [];

      for (const task of tasks) {
        
        const email = task.userEmail;
        const url = `http://localhost:4000/api/users/email/${encodeURIComponent(email)}`
        const userResp = await axios.get(url);
        const user = userResp.data;

        if (user?.notificationPreference?.email?.enabled) {
          
          const cronSchedule = user.notificationPreference.email.scheduleCron || '*/15 * * * *';
          const part = cronSchedule.split('/')[1];
          const interval = parseInt(part, 10) || 15;
          
          const now = new Date();
          if (now.getMinutes() % interval !== 0) {
            continue; // not time for this user's schedule
          }

          // Send email
          const when = (task.reminder && task.reminder.enabled && task.reminder.remindAt) ? task.reminder.remindAt : task.dueDate;
          await EmailClient.sendEmail(user.userEmail, 'Task Reminder', `Reminder: ${task.taskName} is due at ${when}`);
        }
      }
    } catch (err) {
      console.error('Error in checkAndNotify', err);
    }
  }

    triggerCheck = async (req: Request, res: Response): Promise<void> => {
      try {
        await this.checkAndNotify();
        res.status(200).json({ ok: true });
      } catch (error) {
        console.error('triggerCheck error', error);
        res.status(500).json({ message: 'Server error' });
      }
    };
}

export default NotificationService;