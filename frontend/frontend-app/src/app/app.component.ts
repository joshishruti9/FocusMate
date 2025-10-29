import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <nav class="navbar navbar-expand navbar-light bg-light">
      <a class="navbar-brand" href="#">FocusMate</a>
      <ul class="navbar-nav">
        <li class="nav-item"><a class="nav-link" routerLink="">Tasks</a></li>
        <li class="nav-item"><a class="nav-link" routerLink="shop">Shop</a></li>
      </ul>
    </nav>
    <div class="container mt-4">
      <router-outlet></router-outlet>
    </div>
  `
})
export class AppComponent {}


