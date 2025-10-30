import { Component } from '@angular/core';
import { TaskComponent } from './components/TaskComponent/task.component';
import { HomeComponent } from './components/HomeComponent/home.component';
import { NavbarComponent } from './components/NavbarComponent/navbar.component';


@Component({
  selector: 'app-root',
  standalone: true,           
  imports: [TaskComponent, NavbarComponent, HomeComponent],
  template: `
    <app-home></app-home>
  `,
  styleUrls: ['./app.component.css']
})
export class AppComponent {}