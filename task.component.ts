import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../services/task.service';
import { CommonModule } from '@angular/common';
import {NavbarComponent} from '../NavbarComponent/navbar.component';

@Component({
  selector: 'app-create-task',
  standalone: true,
  imports: [FormsModule, CommonModule, NavbarComponent],
  providers: [TaskService],
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.css']
})
export class TaskComponent {
  task = { name: '', dueDate: '', priority: '', category: '' };
  successMessage: string = '';
  errorMessage: string = '';
  minDate: string;

  constructor(private taskService: TaskService) {
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
  }

  createTask() {
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

  viewTasks() {
    this.taskService.getTasks().subscribe(tasks => {
      console.log('Retrieved tasks:', tasks);
    });
  }

    viewPendingTasks() {
    this.taskService.getPendingTasks().subscribe(tasks => {
      console.log('Retrieved tasks:', tasks);
    });
  }

    viewTaskbyId() {
    this.taskService.getTaskbyId().subscribe(tasks => {
      console.log('Retrieved tasks:', tasks);
    });

  }
}

function viewTaskbyId() {
      throw new Error('Function not implemented.');
    }
