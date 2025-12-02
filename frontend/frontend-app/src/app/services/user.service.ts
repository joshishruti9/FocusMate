import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = 'http://localhost:4000/api/users/email';
  constructor(private http: HttpClient) {}

  private getAuthHeaders() {
  const raw = localStorage.getItem('currentUser');
  const parsed = raw ? JSON.parse(raw) : null;
  const token = parsed?.token;
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
}
  

  getUserByEmail(email: string): Observable<any> {
    const url = email ? `${this.apiUrl}/${encodeURIComponent(email)}` : this.apiUrl;
    return this.http.get<any[]>(url, this.getAuthHeaders());
  }
}
