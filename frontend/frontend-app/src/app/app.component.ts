import { Component } from '@angular/core';
import { NavbarComponent } from './components/NavbarComponent/navbar.component';
import { FooterComponent } from './components/FooterComponent/footer.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    NavbarComponent,
    FooterComponent,
    RouterOutlet, 
  ],
  template: `
    <app-navbar></app-navbar>
    <div class="content-wrapper">
      <router-outlet></router-outlet>
    </div>
    <app-footer></app-footer>
  `,
  styleUrls: ['./app.component.css']
})
export class AppComponent {}











