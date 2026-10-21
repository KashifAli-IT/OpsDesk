
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
    path: 'tickets/:id',
    loadComponent: () =>
      import('./pages/ticket-detail/ticket-detail').then(m => m.TicketDetail)
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
