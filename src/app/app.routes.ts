import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { WarehouseListComponent } from './warehouse-list/warehouse-list.component';
import { WarehouseDetailComponent } from './warehouse-details/warehouse-details.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'warehouse', component: WarehouseListComponent },
  { path: 'warehouse/:id', component: WarehouseDetailComponent },
  { path: '**', redirectTo: '' },
];
