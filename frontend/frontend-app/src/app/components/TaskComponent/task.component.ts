import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
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
export class TaskComponent implements OnInit {
  CreateTask  = { taskName: '', dueDate: '', priority: '', category: '', description: '', userEmail: ''};
  editMode: boolean = false;
  editingTaskId: string | null = null;
  successMessage: string = '';
  errorMessage: string = '';
  minDate: string;
  description: string = '';
  userEmail: string = '';

  constructor(private taskService: TaskService, private authService: AuthService, private route: ActivatedRoute, private router: Router) {
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
    const currentUser = this.authService.getUser();
    if (currentUser && currentUser.userEmail) {
      this.CreateTask.userEmail = currentUser.userEmail;
      this.userEmail = currentUser.userEmail;
    }
  }

  ngOnInit(): void {
    // Check for editId query param
    this.route.queryParams.subscribe(params => {
      const editId = params['editId'];
      if (editId) {
        this.loadTaskForEdit(editId);
      }
    });
  }

  loadTaskForEdit(id: string) {
    this.editMode = true;
    this.editingTaskId = id;
    this.taskService.getTaskById(id).subscribe({
      next: (task) => {
        if (!task) {
          console.error('No task returned for edit');
          return;
        }
        this.CreateTask = {
          taskName: task.taskName || '',
          dueDate: (task.dueDate || '').split('T')[0],
          priority: task.priority || '',
          category: task.category || '',
          description: task.description || '',
          userEmail: task.userEmail || ''
        };
        this.userEmail = task.userEmail || '';
      },
      error: (err) => {
        console.error('Failed to load task for edit', err);
      }
    });
  }

  reminderConfig: ReminderConfig | null = null;

  onReminderChange(config: ReminderConfig): void {
    this.reminderConfig = config;
    console.log('Reminder configuration:', config);
  }

  createTask(form?: NgForm) {
  try {
      this.successMessage = '';
      this.errorMessage = '';
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
      if (this.editMode && this.editingTaskId) {
        // Call edit service
        this.taskService.editTask(payload as any, this.editingTaskId).subscribe({
          next: () => {
            this.successMessage = 'Success: Quest updated.';
            if (form) {
              form.resetForm({ userEmail: this.userEmail });
            }
            this.reminderConfig = null;
            this.editMode = false;
            this.editingTaskId = null;
            this.router.navigate(['/viewTasks']);
          },
          error: err => {
            console.error('API Error (Async):', err);
              this.errorMessage = 'Error: Failed to log quest. Check console for details.';
          }
        });
          this.errorMessage = ''; // Clear errorMessage on create success
      } else {
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
            // Optionally navigate back to view tasks
            this.router.navigate(['/viewTasks']);
          },
          error: err => {
            console.error('API Error (Async):', err);
            this.errorMessage = 'Error: Failed to log quest. Check console for details.';
          }
        });
      }
      } catch (err) {
      console.error('Error Occured', err);
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

