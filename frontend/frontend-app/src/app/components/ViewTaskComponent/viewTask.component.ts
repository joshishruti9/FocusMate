import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TaskService } from '../../services/task.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

interface Task {
  _id: string;
  taskId: string;
  taskName: string;
  description: string;
  dueDate: string;
  priority: string;
  category: string;
  userEmail: string;
  isCompleted?: boolean;
  __v?: number;
}

@Component({
  selector: 'app-view-tasks',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink], 
   providers: [TaskService],
  templateUrl: './viewTask.component.html',
  styleUrls: ['./viewTask.component.css']
})


export class ViewTasksComponent implements OnInit {
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  user: any = null;
  
  filterPriority: string = 'all';
  filterCategory: string = 'all';
  sortBy: string = 'dueDate';
  searchTerm: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(private taskService: TaskService, private authService: AuthService, private router: Router) {
  }

  categoryIcons: { [key: string]: string } = {
    work: '💼',
    personal: '👤',
    health: '🏃',
    learning: '📚',
    home: '🏠',
    social: '👥',
    finance: '💰',
    other: '🎯'
  };


  ngOnInit(): void {
    this.user = this.authService.getUser();
    this.loadTasks();
  }

  loadTasks(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const email = this.user?.userEmail;
    this.taskService.getTasks(email).subscribe({
      next: (pendingTasks) => {
        console.log('Retrieved tasks:', pendingTasks);
        this.tasks = pendingTasks;
        this.filteredTasks = [...this.tasks];
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
        this.errorMessage = 'Failed to load tasks. Please try again later.';
        this.isLoading = false;
      },
      complete: () => {
        console.log('Task loading completed');
      }
    });

  }

  applyFilters(): void {
    this.filteredTasks = this.tasks.filter(task => {
      const matchesPriority = this.filterPriority === 'all' || task.priority === this.filterPriority;
      const matchesCategory = this.filterCategory === 'all' || task.category === this.filterCategory;
      const matchesSearch = !this.searchTerm || 
        task.taskName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(this.searchTerm.toLowerCase()));
      
      return matchesPriority && matchesCategory && matchesSearch;
    });

    this.applySorting();
  }

  applySorting(): void {
    this.filteredTasks.sort((a, b) => {
      switch (this.sortBy) {
        case 'dueDate':
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        
        case 'priority':
          const priorityOrder: { [key: string]: number } = { High: 3, Medium: 2, Low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        
        case 'name':
          return a.taskName.localeCompare(b.taskName);
        
        default:
          return 0;
      }
    });
  }

  completeTask(id: string): void {
    const task = this.tasks.find(t => t._id === id);
    if (task) {
      this.taskService.completeTask(task, id).subscribe({
        next: () => {
          console.log('Task marked as completed:', id);
        },
        error: (error: any) => {
          console.error('Error completing task:', error);
        }
      });
      alert('Quest completed!\nYou earned XP!');
      this.tasks = this.tasks.filter(t => t._id !== id);
      this.applyFilters();
    }
  }

  getTotalXP(): number {
    return this.filteredTasks.reduce((total, task) => {
      const priorityPoints: { [key: string]: number } = { Low: 10, Medium: 30, High: 50 };
      return total + (priorityPoints[task.priority] || 0);
    }, 0);
  }
  
  editTask(id: string, task: Task): void {
    // Navigate to the CreateTask component with query param to enable edit mode
    this.router.navigate(['/task'], { queryParams: { editId: id } });
  }

  deleteTask(taskId: string): void {
  this.taskService.deleteTask(taskId).subscribe({
    next: (response) => {
      console.log("Task deleted:", response);
      this.tasks = this.tasks.filter(t => t._id !== taskId);
      this.filteredTasks = [...this.tasks];
    },
    error: (err) => {
      console.error("Delete error:", err);
    }
  });
}

  getTotalTasks(): number {
    return this.filteredTasks.length;
  }

  getHighPriorityCount(): number {
    return this.filteredTasks.filter(t => t.priority === 'High').length;
  }

  getDueTodayCount(): number {
    const today = new Date().toISOString().split('T')[0];
    return this.filteredTasks.filter(t => t.dueDate === today).length;
  }

  getPriorityText(priority: string): string {
    const priorityText: { [key: string]: string } = {
      Low: 'Low Priority',
      Medium: 'Medium Priority',
      High: 'High Priority'
    };
    return priorityText[priority] || priority;
  }

  getCategoryIcon(category: string): string {
    return this.categoryIcons[category] || '🎯';
  }

  getDueDateText(dueDate: string): string {
    const due = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    
    const daysUntilDue = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilDue < 0) {
      return 'Overdue!';
    } else if (daysUntilDue === 0) {
      return 'Due Today';
    } else if (daysUntilDue === 1) {
      return 'Due Tomorrow';
    } else {
      return `Due in ${daysUntilDue} days`;
    }
  }

  getDueDateClass(dueDate: string): string {
    const due = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    
    const daysUntilDue = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilDue < 0) {
      return 'text-danger';
    } else if (daysUntilDue === 0) {
      return 'text-warning';
    } else if (daysUntilDue === 1) {
      return 'text-info';
    }
    return '';
  }
}