// src/app/app.routes.ts
import { Route, Routes } from '@angular/router';
import { HomeComponent } from './components/HomeComponent/home.component';
import { TaskComponent } from './components/TaskComponent/task.component';
import { ShopComponent } from './components/ShopComponent/shop.component';
import { ViewTasksComponent } from './components/ViewTaskComponent/viewTask.component';
import { LoginComponent } from './components/loginComponent/login.component';
import { AuthGuard } from './services/auth.guard';

export const appRoutes: Route[] = [
  { path: '', component: HomeComponent }, // default route
  { path: 'shop', component: ShopComponent, canActivate: [AuthGuard] },   // shop route
  { path: 'task', component: TaskComponent, canActivate: [AuthGuard] },  // task route
  { path: 'viewTasks', component: ViewTasksComponent, canActivate: [AuthGuard] },  // view tasks route
  {path: 'login', component: LoginComponent},  // view tasks route
  { path: '**', component: HomeComponent } // fallback route
];




