import { Route } from '@angular/router';
import { CreateTaskComponent } from './components/create-task/create-task.component';
import { ShopComponent } from './components/shop/shop.component';

export const routes: Route[] = [
  { path: '', component: CreateTaskComponent }, // default route
  { path: 'shop', component: ShopComponent },  // shop route
];


