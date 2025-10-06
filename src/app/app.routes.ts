import { Routes } from '@angular/router';
import { StorageListComponent } from './storage-list/storage-list.component';
import { StorageDetailComponent } from './storage-details/storage-details.component';
import { SearchComponent } from './search/search.component';
import { LoginComponent } from './login.component';
import { TimelineComponent } from './timeline/timeline.component';
import { AccessDeniedComponent } from './access-denied.component';
import { roleGuard } from './role.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'access-denied', component: AccessDeniedComponent },
  { path: 'search', component: SearchComponent, canActivate: [roleGuard] },
  { path: 'timeline', component: TimelineComponent, canActivate: [roleGuard] },
  { path: 'storage', component: StorageListComponent, canActivate: [roleGuard] },
  { path: 'storage/:id', component: StorageDetailComponent, canActivate: [roleGuard] },
  { path: '**', redirectTo: '' },
];
