import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router'
import { FooterComponent } from './components/FooterComponent/footer.component';
import { NavbarComponent } from './components/NavbarComponent/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    NavbarComponent, 
    FooterComponent
  ],
  template: `
    <router-outlet></router-outlet>
  `,
  styleUrls: ['./app.component.css']
})
export class AppComponent {}