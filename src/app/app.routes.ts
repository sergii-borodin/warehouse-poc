import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { StorageListComponent } from './storage-list/storage-list.component';
import { StorageDetailComponent } from './storage-details/storage-details.component';
import { SearchComponent } from './search/search.component';

export const routes: Routes = [
  // { path: '', component: HomeComponent },
  { path: '', component: SearchComponent },
  { path: 'storage', component: StorageListComponent },
  { path: 'storage/:id', component: StorageDetailComponent },
  { path: '**', redirectTo: '' },
];
