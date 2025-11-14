import { Component } from '@angular/core';
import { NavbarComponent } from './components/NavbarComponent/navbar.component';
import { TaskComponent } from './components/TaskComponent/task.component';
import { ShopComponent } from './components/ShopComponent/shop.component';
import { HttpClientModule } from '@angular/common/http';  
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

