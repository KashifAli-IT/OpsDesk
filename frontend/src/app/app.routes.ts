import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/overview/overview').then(m => m.Overview),
    pathMatch: 'full'
  },
  {
    path: 'tickets',
    loadComponent: () =>
      import('./pages/tickets/tickets').then(m => m.Tickets)
  },
  {
    path: 'customers',
    loadComponent: () =>
      import('./pages/customers/customers').then(m => m.Customers)
  },
  {
    path: 'reports',
    loadComponent: () =>
      import('./pages/reports/reports').then(m => m.Reports)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
