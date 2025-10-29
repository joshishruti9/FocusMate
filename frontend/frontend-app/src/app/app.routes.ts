import { Routes } from '@angular/router';
import { HomeComponent } from './components/HomeComponent/home.component';
import { TaskComponent } from './components/TaskComponent/task.component';

export const routes: Routes = [ 
    { path: 'task', component: TaskComponent },
    {path: '', component: HomeComponent}
];
