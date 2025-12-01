import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TaskService, CompletedTask } from '../../services/task.service';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-completed-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  providers: [TaskService, UserService],
  templateUrl: './completed-tasks.component.html',
  styleUrls: ['./completed-tasks.component.css']
})
export class CompletedTasksComponent implements OnInit {
  tasks: CompletedTask[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';
  user: any = null;
  rewardPoints = 0;
  totalEarned = 0;

  constructor(private taskService: TaskService, private userService: UserService, private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.user = this.authService.getUser();
    if (!this.user) {
      // redirect to login if not authenticated
      this.router.navigate(['/login']);
      return;
    }
    this.loadCompletedTasks();
    // Fetch and display summary totalEarned
    this.taskService.getCompletedSummary(this.user?.userEmail).subscribe({
      next: (r) => { this.totalEarned = r.totalEarned || 0; },
      error: () => { /* ignore */ }
    });
    if (this.user?.userEmail) {
      this.userService.getUserByEmail(this.user.userEmail).subscribe({
        next: (u) => { this.rewardPoints = u.rewardPoints || 0; },
        error: () => { this.rewardPoints = 0; }
      });
    }
  }

  loadCompletedTasks(): void {
    this.isLoading = true;
    this.taskService.getCompletedTasks(this.user?.userEmail).subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.totalEarned = tasks.reduce((sum, t) => sum + (t.rewardPoints || 0), 0);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load completed tasks', err);
        this.errorMessage = 'Failed to load completed tasks.';
        this.isLoading = false;
      }
    });
  }
}
