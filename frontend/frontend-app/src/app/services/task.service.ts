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

export interface CompletedTask {
  _id: string;
  userEmail: string;
  taskName: string;
  description?: string;
  dueDate: string;
  category: string;
  priority: string;
  rewardPoints?: number;
  completedAt?: string;
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
  private getAuthHeaders() {
    const raw = localStorage.getItem('currentUser');
    const parsed = raw ? JSON.parse(raw) : null;
    const token = parsed?.token;
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  }

  createTask(task: CreateTask ): Observable<Task> {
    return this.http.post<Task>(this.apiUrl, task, this.getAuthHeaders());
  }

  getTasks(email?: string): Observable<Task[]> {
    const url = email ? `${this.apiUrl}?userEmail=${encodeURIComponent(email)}` : this.apiUrl;
    return this.http.get<Task[]>(url, this.getAuthHeaders());
  }

  getPendingTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/pending`);
  }

  getCompletedTasks(email?: string): Observable<CompletedTask[]> {
    const url = email ? `${this.apiUrl}/completed?userEmail=${encodeURIComponent(email)}` : `${this.apiUrl}/completed`;
    return this.http.get<CompletedTask[]>(url, this.getAuthHeaders());
  }

  getCompletedSummary(email?: string): Observable<{ totalEarned: number }> {
    const url = email ? `${this.apiUrl}/completed/summary?userEmail=${encodeURIComponent(email)}` : `${this.apiUrl}/completed/summary`;
    return this.http.get<{ totalEarned: number }>(url, this.getAuthHeaders());
  }

  editTask(task: Task, id: string) : Observable<Task>{
    // Send the task object as the request body to update
    return this.http.put<Task>(`${this.apiUrl}/${encodeURIComponent(id)}`, task, this.getAuthHeaders());
  }
  completeTask(task: Task, id: string) : Observable<Task>{
    return this.http.post<Task>(`${this.apiUrl}/complete/${id}`, task, this.getAuthHeaders());
  }

  deleteTask(taskId: string) {
  return this.http.delete<{ message: string }>(`${this.apiUrl}/${encodeURIComponent(taskId)}`, this.getAuthHeaders());
}

  getTaskById(id: string): Observable<Task> {
    return this.http.get<Task>(`${this.apiUrl}/${id}`, this.getAuthHeaders());
  }
}
