import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: any = null;
  purchasedItems: any[] = [];

  constructor(private authService: AuthService, private userService: UserService, private router: Router) {}

  ngOnInit(): void {
    this.user = this.authService.getUser();
    if (!this.user) {
      this.router.navigate(['/login']);
      return;
    }
    this.userService.getUserByEmail(this.user.userEmail).subscribe({
      next: (u) => { this.user = u; this.purchasedItems = u.purchasedItems || []; },
      error: (err) => { console.error('Failed to load profile', err); }
    });
  }
}