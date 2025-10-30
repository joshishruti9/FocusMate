import { Route } from '@angular/router';
import { ShopComponent } from './components/shop/shop.component';
import { HomeComponent } from './components/HomeComponent/home.component';
import { TaskComponent } from './components/TaskComponent/task.component';

export const routes: Route[] = [
  { path: '', component: HomeComponent }, // default route
  { path: 'shop', component: ShopComponent },   // shop route
  { path: 'task', component: TaskComponent }  // task route
];




