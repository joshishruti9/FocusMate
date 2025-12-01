import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

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
    this.userSubject.next(user);
  }

  getUser() {
    const raw = localStorage.getItem('currentUser');
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed?.user || null;
  }

  clearUser() {
    localStorage.removeItem('currentUser');
    this.userSubject.next(null);
  }

  getToken(): string | null {
    const raw = localStorage.getItem('currentUser');
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed?.token || null;
  }

  // Observable of current user for components to react to login/logout
  private userSubject = new BehaviorSubject<any>(this.getUser());
  public currentUser$ = this.userSubject.asObservable();
}
