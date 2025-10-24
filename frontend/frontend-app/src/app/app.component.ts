import { Component } from '@angular/core';
import { CreateTaskComponent } from './components/create-task/create-task.component';
import { FormsModule } from '@angular/forms'; // needed for ngModel
import { BrowserModule } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  standalone: true, // ✅ This makes it standalone
  imports: [
    BrowserModule,
    FormsModule,
    CreateTaskComponent
  ],
  template: `
    <h1>FocusMate Todo App</h1>
    <app-create-task></app-create-task>
  `,
  styleUrls: ['./app.component.css']
})
export class AppComponent {}