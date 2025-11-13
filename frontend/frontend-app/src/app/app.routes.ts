// src/app/app.routes.ts
import { Route, Routes } from '@angular/router';
import { HomeComponent } from './components/HomeComponent/home.component';
import { TaskComponent } from './components/TaskComponent/task.component';
import { ShopComponent } from './components/ShopComponent/shop.component';
import { ViewTasksComponent } from './components/ViewTaskComponent/viewTask.component';

export const appRoutes: Route[] = [
  { path: '', component: HomeComponent }, // default route
  { path: 'shop', component: ShopComponent },   // shop route
  { path: 'task', component: TaskComponent },  // task route
  {path: 'viewTasks', component: ViewTasksComponent},  // view tasks route
  { path: '**', redirectTo: 'home' } // fallback route
];




