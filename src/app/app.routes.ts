import { Routes } from '@angular/router';
import { LoginComponent } from './login.component';
import { AccessDeniedComponent } from './access-denied.component';
import { roleGuard } from './role.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'access-denied', component: AccessDeniedComponent },
  {
    path: 'search',
    canActivate: [roleGuard],
    loadComponent: () => import('./search/search.component').then((m) => m.SearchComponent),
  },
  {
    path: 'timeline',
    canActivate: [roleGuard],
    loadComponent: () => import('./timeline/timeline.component').then((m) => m.TimelineComponent),
  },
  {
    path: 'deadline',
    canActivate: [roleGuard],
    loadComponent: () => import('./deadline/deadline.component').then((m) => m.DeadlineComponent),
  },
  {
    path: 'storage',
    canActivate: [roleGuard],
    loadComponent: () =>
      import('./storage-list/storage-list.component').then((m) => m.StorageListComponent),
  },
  {
    path: 'storage/:id',
    canActivate: [roleGuard],
    loadComponent: () =>
      import('./storage-details/storage-details.component').then((m) => m.StorageDetailComponent),
  },
  { path: '**', redirectTo: '' },
];
