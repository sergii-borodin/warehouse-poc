import { Routes } from '@angular/router';
import { StorageListComponent } from './storage-list/storage-list.component';
import { StorageDetailComponent } from './storage-details/storage-details.component';
import { SearchComponent } from './search/search.component';
import { LoginComponent } from './login.component';
import { TimelineComponent } from './timeline/timeline.component';
import { authGuard } from './auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'search', component: SearchComponent, canActivate: [authGuard] },
  { path: 'timeline', component: TimelineComponent, canActivate: [authGuard] },
  { path: 'storage', component: StorageListComponent },
  { path: 'storage/:id', component: StorageDetailComponent },
  { path: '**', redirectTo: '' },
];
