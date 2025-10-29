import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Task {
  name: string;
  dueDate: string;
  priority: string;
  category: string;
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = 'http://localhost:5000/api/tasks'; // Your backend endpoint

  constructor(private http: HttpClient) {}

  createTask(task: Task): Observable<Task> {
    return this.http.post<Task>(this.apiUrl, task);
  }

  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.apiUrl);
  }

  getPendingTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.apiUrl + '/pending');
  }

  getTaskbyId(): Observable<Task[]> {
    return this.http.get<Task[]>(this.apiUrl + '/:id');
  }
}