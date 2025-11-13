// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { HomeComponent } from './components/HomeComponent/home.component';
import { TaskComponent } from './components/TaskComponent/task.component';
import { ShopComponent } from './components/ShopComponent/shop.component';

export const appRoutes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' }, // default route
  { path: 'home', component: HomeComponent },
  { path: 'tasks', component: TaskComponent },
  { path: 'shop', component: ShopComponent },
  { path: '**', redirectTo: 'home' } // fallback route
];




