import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../services/task.service';
import { AuthService } from '../../services/auth.service';
import { interval, Subscription } from 'rxjs';

interface BannerNotification {
  id: string;
  taskName: string;
  dueDate: string;
  reminderTime: string;
  priority: string;
  frequency: string;
  weekDay?: string;
  show: boolean;
}

@Component({
  selector: 'app-notification-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-banner.component.html',
  styleUrls: ['./notification-banner.component.css']
})
export class NotificationBannerComponent implements OnInit, OnDestroy {
  notifications: BannerNotification[] = [];
  private checkSubscription?: Subscription;
  private dismissedNotifications: Set<string> = new Set();

  constructor(
    private taskService: TaskService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.checkForReminders();
    }, 1000);

    this.checkSubscription = interval(60000).subscribe(() => {
      this.checkForReminders();
    });
  }

  ngOnDestroy(): void {
    this.checkSubscription?.unsubscribe();
  }

  checkForReminders(): void {
    const user = this.authService.getUser();
    if (!user?.userEmail) {
      console.log('No user logged in, skipping reminder check');
      return;
    }

    console.log('Checking reminders for user:', user.userEmail);
    this.taskService.getTasks(user.userEmail).subscribe({
      next: (tasks) => {
        console.log('Total tasks fetched:', tasks.length);
        
        const now = new Date();
        const tasksWithReminders = tasks.filter(task => task.reminder?.enabled);
        console.log('Tasks with reminders enabled:', tasksWithReminders.length);
        
        tasksWithReminders.forEach(task => {
          if (this.dismissedNotifications.has(task._id)) {
            console.log(`Task ${task.taskName} already dismissed`);
            return;
          }

          if (!task.reminder?.enabled || !task.reminder?.remindAt) {
            console.log(`Task ${task.taskName} has no valid reminder`);
            return;
          }

          const remindAt = new Date(task.reminder.remindAt);
          console.log(remindAt.getTime()," remindat vs now ",now.getTime())
          const diffMinutes = Math.floor((remindAt.getTime() - now.getTime()) / 60000);

          console.log(`Task: ${task.taskName}, Remind at: ${remindAt.toLocaleString()}, Diff: ${diffMinutes} minutes`);

        
          if (diffMinutes <= 15 && diffMinutes >= -60) {
            const existing = this.notifications.find(n => n.id === task._id);
            
            if (!existing) {
              console.log(`✅ Showing notification for: ${task.taskName}`);
              this.notifications.push({
                id: task._id,
                taskName: task.taskName,
                dueDate: task.dueDate,
                reminderTime: task.reminder.remindAt,
                priority: task.priority,
                frequency: task.reminder.frequency || 'once',
                weekDay: task.reminder.weekDay,
                show: true
              });
            }
          } else {
            console.log(`⏰ Task ${task.taskName} not due yet (${diffMinutes} minutes away)`);
          }
        });

        // Remove old notifications (older than 1 hour past reminder time)
        const beforeCount = this.notifications.length;
        this.notifications = this.notifications.filter(n => {
          const remindAt = new Date(n.reminderTime);
          const diffMinutes = Math.floor((remindAt.getTime() - now.getTime()) / 60000);
          return diffMinutes >= -60;
        });
        
        if (beforeCount !== this.notifications.length) {
          console.log(`Removed ${beforeCount - this.notifications.length} old notifications`);
        }

        console.log('Current active notifications:', this.notifications.length);
      },
      error: (err) => {
        console.error('❌ Error checking for reminders:', err);
      }
    });
  }

  dismissNotification(notificationId: string): void {
    console.log('Dismissing notification:', notificationId);
    this.dismissedNotifications.add(notificationId);
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
  }

  getTimeUntilReminder(reminderTime: string): string {
    const now = new Date();
    const remind = new Date(reminderTime);
    const diffMinutes = Math.floor((remind.getTime() - now.getTime()) / 60000);

    if (diffMinutes < -5) {
      return 'Reminder time passed!';
    } else if (diffMinutes >= -5 && diffMinutes <= 0) {
      return 'Now!';
    } else if (diffMinutes === 1) {
      return 'in 1 minute';
    } else if (diffMinutes < 60) {
      return `in ${diffMinutes} minutes`;
    } else {
      const hours = Math.floor(diffMinutes / 60);
      const mins = diffMinutes % 60;
      return mins > 0 ? `in ${hours}h ${mins}m` : `in ${hours} hour${hours > 1 ? 's' : ''}`;
    }
  }

  getPriorityClass(priority: string): string {
    return `priority-${priority.toLowerCase()}`;
  }

  getPriorityIcon(priority: string): string {
    const icons: { [key: string]: string } = {
      'High': '🔴',
      'Medium': '🟡',
      'Low': '🟢'
    };
    return icons[priority] || '⚪';
  }

  getFrequencyText(frequency: string, weekDay?: string): string {
    if (frequency === 'daily') return '📅 Daily';
    if (frequency === 'weekly' && weekDay) {
      const dayName = weekDay.charAt(0).toUpperCase() + weekDay.slice(1);
      return `📆 Every ${dayName}`;
    }
    return '🔔 One-time';
  }
}