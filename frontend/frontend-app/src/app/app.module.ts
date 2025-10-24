import { Component } from '@angular/core';
import { CreateTaskComponent } from './components/create-task/create-task.component';

@Component({
  selector: 'app-root',
  standalone: true,           
  imports: [CreateTaskComponent],
  template: `
    <h1>FocusMate Todo App</h1>
    <app-create-task></app-create-task>
  `,
  styleUrls: ['./app.component.css']
})
export class AppComponent {}