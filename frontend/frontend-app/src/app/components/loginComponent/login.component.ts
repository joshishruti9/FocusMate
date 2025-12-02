import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit {
  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => this.initializeGoogleSignIn();
    document.head.appendChild(script);
  }

  initializeGoogleSignIn() {
    // TODO: Replace with your real client ID or use env variable
    const clientId = (window as any).__env?.GOOGLE_CLIENT_ID || '109401400332-e8j188na64feh8p1pf42vr68inpo644v.apps.googleusercontent.com';
    (window as any).google?.accounts?.id?.initialize({
      client_id: clientId,
      callback: (response: any) => this.handleCredentialResponse(response),
    });
    const buttonDiv = document.getElementById('googleSignInDiv');
    if (buttonDiv) {
      (window as any).google.accounts.id.renderButton(buttonDiv, { theme: 'outline', size: 'large' });
    }
  }

  handleCredentialResponse(response: any) {
    if (!response || !response.credential) {
      // redirect to home or show error
      window.location.href = '/';
      return;
    }
    // send idToken to backend to verify and fetch user+tasks
    this.authService.loginWithIdToken(response.credential).subscribe({
      next: (res) => {
        if (res && res.user) {
          const token = res.token;
          this.authService.setUser(res.user, token);
          // If tasks returned, you may save them or navigate where tasks are shown
          this.router.navigate(['/viewTasks']);
        } else {
          this.router.navigate(['/login']);
        }
      },
      error: (err) => {
        console.error('Login failed', err);
        // navigate to home on login failure
        this.router.navigate(['/']);
      }
    });
  }
}