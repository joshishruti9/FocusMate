import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-create-task',
  standalone: true, 
  imports: [FormsModule], 
  templateUrl: './create-task.component.html',
  styleUrls: ['./create-task.component.css']
})
export class CreateTaskComponent {
  task = { name: '', dueDate: '', priority: '', category: '' };
  successMessage: string = '';
  errorMessage: string = '';

  constructor(private taskService: TaskService) {}

   onSubmit() {
    this.taskService.createTask(this.task).subscribe({
      next: () => {
        this.successMessage = 'Task created successfully!';
        this.task = { name: '', dueDate: '', priority: '', category: '' };
      },
      error: err => console.error(err)
    });
  }
}