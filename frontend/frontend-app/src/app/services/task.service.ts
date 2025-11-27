import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Task {
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

export interface CreateTask {
  taskName: string;
  dueDate: string;
  priority: string;
  category: string;
  description: string;
  userEmail: string;
  reminder?: {
    enabled?: boolean;
    remindAt?: string;
  };
}


@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = 'http://localhost:5000/api/tasks';

  constructor(private http: HttpClient) {}

  createTask(task: CreateTask ): Observable<Task> {
    return this.http.post<Task>(this.apiUrl, task);
  }

  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.apiUrl);
  }

  getPendingTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/pending`);
  }

  editTask(task: Task, id: string) : Observable<Task>{
    const email = task.userEmail;
    return this.http.put<Task>(`${this.apiUrl}/${id}`, email);
  }
  completeTask(task: Task, id: string) : Observable<Task>{
    return this.http.post<Task>(`${this.apiUrl}/complete/${id}`, task);
  }

  deleteTask(taskId: string) {
  return this.http.delete<{ message: string }>(`${this.apiUrl}/${encodeURIComponent(taskId)}`);
}

  getTaskById(id: string): Observable<Task> {
    return this.http.get<Task>(`${this.apiUrl}/${id}`);
  }
}
