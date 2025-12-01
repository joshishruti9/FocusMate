import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';


@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})

export class NavbarComponent implements OnInit {
  user: any = null;
  rewardPoints: number = 0;
  constructor(private authService: AuthService, private userService: UserService, private router: Router) {
    this.user = this.authService.getUser();
    if (this.user?.userEmail) {
      this.userService.getUserByEmail(this.user.userEmail).subscribe({
        next: (u) => this.rewardPoints = u.rewardPoints || 0,
        error: () => this.rewardPoints = 0
      });
    }
  }

  ngOnInit(): void {
    this.user = this.authService.getUser();
    // Update user on navigation events so navbar reflects login/logout changes
    this.router.events.subscribe(() => {
      this.user = this.authService.getUser();
      if (this.user?.userEmail) {
        this.userService.getUserByEmail(this.user.userEmail).subscribe({
          next: (u) => this.rewardPoints = u.rewardPoints || 0,
          error: () => this.rewardPoints = 0
        });
      } else {
        this.rewardPoints = 0;
      }
    });
  }

  logout() {
    this.authService.clearUser();
    this.user = null;
    this.router.navigate(['/login']);
  }
}