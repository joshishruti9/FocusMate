import { Component } from '@angular/core';
import { NavbarComponent } from './components/NavbarComponent/navbar.component';
import { TaskComponent } from './components/TaskComponent/task.component';
import { ShopComponent } from './components/ShopComponent/shop.component';
import { HttpClientModule } from '@angular/common/http';  

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NavbarComponent, TaskComponent, ShopComponent, HttpClientModule],
  template: `
    <app-navbar></app-navbar>
    <div class="container mt-4">
      <h1 class="text-center mb-4">FocusMate</h1>
      <div class="row">
        <div class="col-md-6">
          <app-create-task></app-create-task>
        </div>
        <div class="col-md-6">
          <app-shop></app-shop>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./app.component.css']
})
export class AppComponent {}

