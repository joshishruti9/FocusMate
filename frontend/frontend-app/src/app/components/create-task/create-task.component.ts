import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../services/task.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-create-task',
  standalone: true, 
  imports: [FormsModule, CommonModule], 
  providers: [TaskService],
  templateUrl: './create-task.component.html',
  styleUrls: ['./create-task.component.css']
})
export class CreateTaskComponent {
  task = { name: '', dueDate: '', priority: '', category: '' };
  successMessage: string = '';
  errorMessage: string = '';
  minDate: string;

  constructor(private taskService: TaskService) {
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
  }

  onSubmit() {
  try {
      this.taskService.createTask(this.task).subscribe({
        next: () => {
          console.log('API call successful.'); 
          this.successMessage = 'Success: New Quest Logged! Preparing for deployment.';
          this.task = { name: '', dueDate: '', priority: '', category: '' };
        },
        error: err => {
          console.error('API Error (Async):', err);
          this.errorMessage = 'Error: Failed to log quest. Check console for details.';
        }
        });
      } catch (syncError) {
      console.error('CRITICAL SYNCHRONOUS ERROR (Failed to start API call):', syncError);
      this.errorMessage = 'Error: A critical app error occurred during submission.';
    }
  }
}