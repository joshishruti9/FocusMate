import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = 'http://localhost:8000/api/user/api/users';
  constructor(private http: HttpClient) {}

  getUserByEmail(email: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/email/${encodeURIComponent(email)}`);
  }
}
