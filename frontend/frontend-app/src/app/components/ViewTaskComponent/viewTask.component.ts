import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../NavbarComponent/navbar.component';
import { FooterComponent } from '../FooterComponent/footer.component';
import { TaskService } from '../../services/task.service';

interface Task {
  taskName: string;
  description: string;
  dueDate: string;
  priority: string;
  category: string;
  userEmail: string;
}

@Component({
  selector: 'app-view-tasks',
  standalone: true,
  imports: [FormsModule, CommonModule, NavbarComponent, FooterComponent], 
   providers: [TaskService],
  templateUrl: './viewTask.component.html',
  styleUrls: ['./viewTask.component.css']
})


export class ViewTasksComponent implements OnInit {
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  
  filterPriority: string = 'all';
  filterCategory: string = 'all';
  sortBy: string = 'dueDate';
  searchTerm: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';

   constructor(private taskService: TaskService) {
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
    this.loadTasks();
  }

  loadTasks(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.taskService.getTasks().subscribe({
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
          const priorityOrder: { [key: string]: number } = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        
        case 'name':
          return a.taskName.localeCompare(b.taskName);
        
        default:
          return 0;
      }
    });
  }

  /*completeTask(id: number): void {
    const task = this.tasks.find(t => t.taskId === id);
    if (task) {
      alert(`🎉 Quest "${task.taskName}" completed!\nYou earned XP!`);
      this.tasks = this.tasks.filter(t => t.taskId !== id);
      this.applyFilters();
    }
  }*/

  editTask(id: string): void {
    // Navigate to edit page or open edit modal
    console.log('Edit task:', id);
    alert(`Edit functionality for task ${id} - This would navigate to edit page in a real application`);
  }

  /*deleteTask(id: number): void {
    if (confirm('Are you sure you want to delete this quest?')) {
      this.tasks = this.tasks.filter(t => t.taskId !== id);
      this.applyFilters();
    }
  }*/

  // Helper methods for stats
  getTotalTasks(): number {
    return this.filteredTasks.length;
  }

  getHighPriorityCount(): number {
    return this.filteredTasks.filter(t => t.priority === 'high').length;
  }

  getDueTodayCount(): number {
    const today = new Date().toISOString().split('T')[0];
    return this.filteredTasks.filter(t => t.dueDate === today).length;
  }

  // Helper methods for display
  getPriorityText(priority: string): string {
    const priorityText: { [key: string]: string } = {
      low: 'Low Priority',
      medium: 'Medium Priority',
      high: 'High Priority'
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