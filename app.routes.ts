import { Routes } from '@angular/router';
import { HomeComponent } from './components/HomeComponent/home.component';
import { TaskComponent } from './components/TaskComponent/task.component';
import {LoginComponent} from '../../../../../FocusMate-main 5/frontend/frontend-app/src/app/components/LoginComponent/login.component';

export const routes: Routes = [
  { path: 'task', component: TaskComponent },
  {path: '', component: HomeComponent},
  { path: 'login', component: LoginComponent }
];
