import { Component } from '@angular/core';
import { NavbarComponent } from './components/NavbarComponent/navbar.component';
import { ShopComponent } from './components/shop/shop.component';
import { HttpClientModule } from '@angular/common/http';  
import { TaskComponent } from './components/TaskComponent/task.component';
import { HomeComponent } from './components/HomeComponent/home.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NavbarComponent, TaskComponent, ShopComponent, HomeComponent, HttpClientModule],
  template: `
      <app-home></app-home>  
  `,
  styleUrls: ['./app.component.css']
})
export class AppComponent {}

