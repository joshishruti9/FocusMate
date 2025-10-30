import { Component } from '@angular/core';
import { NavbarComponent } from './components/NavbarComponent/navbar.component';
import { FooterComponent } from './components/FooterComponent/footer.component';
import { ShopComponent } from './components/shop/shop.component';
import { HttpClientModule } from '@angular/common/http';
import { RouterOutlet } from '@angular/router';
import { TaskComponent } from './components/TaskComponent/task.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    NavbarComponent,
    FooterComponent,
    TaskComponent,
    ShopComponent,
    HttpClientModule
  ],
  template: `
     <router-outlet></router-outlet>
  `,
  styleUrls: ['./app.component.css']
})
export class AppComponent {}




