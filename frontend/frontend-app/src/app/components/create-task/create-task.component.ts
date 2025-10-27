import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-create-task',
  standalone: true, 
  imports: [FormsModule], 
  providers: [TaskService],
  templateUrl: './create-task.component.html',
  styleUrls: ['./create-task.component.css']
})
export class CreateTaskComponent {
  task = { name: '', dueDate: '', priority: '', category: '' };
  successMessage: string = '';
  errorMessage: string = '';

  constructor(private taskService: TaskService) {}

  onSubmit() {
  try {
      this.taskService.createTask(this.task).subscribe({
        next: () => {
          console.log('API call successful. Should NOT redirect.'); 
          this.successMessage = 'Task created successfully!';
          this.task = { name: '', dueDate: '', priority: '', category: '' };
        },
        error: err => {
          console.error('API Error (Async):', err);
          this.errorMessage = 'Failed to create task.';
        }
        });
      } catch (syncError) {
      console.error('CRITICAL SYNCHRONOUS ERROR (Failed to start API call):', syncError);
      this.errorMessage = 'A critical app error occurred during submission.';
    }
  }
}