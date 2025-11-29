import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { TaskService } from '../../services/task.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { ReminderComponent, ReminderConfig } from '../ReminderComponent/reminder.component';

@Component({
  selector: 'app-create-task',
  standalone: true, 
  imports: [FormsModule, CommonModule, ReminderComponent], 
  providers: [TaskService],
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.css']
})
export class TaskComponent {
  CreateTask  = { taskName: '', dueDate: '', priority: '', category: '', description: '', userEmail: ''};
  successMessage: string = '';
  errorMessage: string = '';
  minDate: string;
  description: string = '';
  userEmail: string = '';

  constructor(private taskService: TaskService, private authService: AuthService) {
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
    const currentUser = this.authService.getUser();
    if (currentUser && currentUser.userEmail) {
      this.CreateTask.userEmail = currentUser.userEmail;
      this.userEmail = currentUser.userEmail;
    }
  }

  reminderConfig: ReminderConfig | null = null;

  onReminderChange(config: ReminderConfig): void {
    this.reminderConfig = config;
    console.log('Reminder configuration:', config);
  }

  createTask(form?: NgForm) {
  try {
      const payload: any = { ...this.CreateTask };
      if (this.reminderConfig?.enabled) {
        try {
          const datePart = this.CreateTask.dueDate || new Date().toISOString().split('T')[0];
          const timePart = this.reminderConfig.time || '09:00';
          const remindAt = new Date(`${datePart}T${timePart}:00`);
          // apply advance notice
          if (this.reminderConfig.advanceNotice && this.reminderConfig.advanceNotice > 0) {
            remindAt.setMinutes(remindAt.getMinutes() - this.reminderConfig.advanceNotice);
          }
          payload.reminder = { enabled: true, remindAt: remindAt.toISOString() };
        } catch (err) {
          console.error('Invalid reminder config', err);
        }
      }
      this.taskService.createTask(payload).subscribe({
        next: () => {
          console.log('API call successful.'); 
          this.successMessage = 'Success: New Quest Logged! Preparing for deployment.';
          // Reset model, keep the user's email pre-filled
          this.CreateTask  = { taskName: '', dueDate: '', priority: '', category: '', description: '', userEmail: this.userEmail };
          // Reset form state to prevent showing validation errors after successful submission
          if (form) {
            form.resetForm({ userEmail: this.userEmail });
          }
          this.reminderConfig = null;
        },
        error: err => {
          console.error('API Error (Async):', err);
          this.errorMessage = 'Error: Failed to log quest. Check console for details.';
        }
        });
      } catch (Error) {
      console.error('Error Occured', Error);
      this.errorMessage = 'Error: A critical app error occurred during submission.';
    }
  }

  onCancel(form: NgForm) {
  form.resetForm(); 
}

  viewTasks() {
    const currentUser = this.authService.getUser();
    const email = currentUser?.userEmail;
    this.taskService.getTasks(email).subscribe(tasks => {
      console.log('Retrieved tasks:', tasks);
    });
  }
    
    viewPendingTasks() {
    this.taskService.getPendingTasks().subscribe(tasks => {
      console.log('Retrieved tasks:', tasks);
    });
  }
    
    viewTaskbyId(taskId: string) {
    this.taskService.getTaskById(taskId).subscribe(tasks => {
      console.log('Retrieved tasks:', tasks);
    });
    

  }
   
}

