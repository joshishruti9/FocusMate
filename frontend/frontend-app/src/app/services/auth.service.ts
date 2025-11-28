import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private authUrl = 'http://localhost:4000/api/users/auth/google'; // API Gateway

  constructor(private http: HttpClient) {}

  loginWithIdToken(idToken: string): Observable<any> {
    return this.http.post<any>(this.authUrl, { idToken });
  }

  setUser(user: any, token?: string) {
    const authData = { user, token };
    localStorage.setItem('currentUser', JSON.stringify(authData));
  }

  getUser() {
    const raw = localStorage.getItem('currentUser');
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed?.user || null;
  }

  clearUser() {
    localStorage.removeItem('currentUser');
  }

  getToken(): string | null {
    const raw = localStorage.getItem('currentUser');
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed?.token || null;
  }
}
