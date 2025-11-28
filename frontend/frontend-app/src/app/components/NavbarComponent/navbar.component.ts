import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';


@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})

export class NavbarComponent implements OnInit {
  user: any = null;
  constructor(private authService: AuthService, private router: Router) {
    this.user = this.authService.getUser();
  }

  ngOnInit(): void {
    this.user = this.authService.getUser();
    // Update user on navigation events so navbar reflects login/logout changes
    this.router.events.subscribe(() => {
      this.user = this.authService.getUser();
    });
  }

  logout() {
    this.authService.clearUser();
    this.user = null;
    this.router.navigate(['/login']);
  }
}