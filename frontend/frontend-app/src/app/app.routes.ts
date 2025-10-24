import { Routes } from '@angular/router';
import { CreateTaskComponent } from './components/create-task/create-task.component';

export const routes: Routes = [ 
    { path: 'create-task', component: CreateTaskComponent },
    { path: '', redirectTo: '/create-task', pathMatch: 'full' },
];
