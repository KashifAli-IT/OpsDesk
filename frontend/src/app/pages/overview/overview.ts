import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  DashboardMetrics,
  Ticket,
  TicketPriority,
  TicketStatus
} from '../../models/ticket.model';
import { TicketService } from '../../services/ticket.service';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview implements OnInit {
  private readonly ticketService = inject(TicketService);

  metrics: DashboardMetrics | null = null;
  tickets: Ticket[] = [];

  loading = true;
  errorMessage = '';

  searchTerm = '';
  selectedStatus = '';
  currentPage = 1;
  pageSize = 5;
  totalTickets = 0;
  totalPages = 0;

  readonly priorities: {
    key: TicketPriority;
    label: string;
    className: string;
    fill: string;
  }[] = [
    { key: 'urgent', label: 'Urgent', className: 'priority-urgent', fill: 'fill-urgent' },
    { key: 'high', label: 'High', className: 'priority-high', fill: 'fill-high' },
    { key: 'medium', label: 'Medium', className: 'priority-medium', fill: 'fill-medium' },
    { key: 'low', label: 'Low', className: 'priority-low', fill: 'fill-low' }
  ];

  readonly statuses: { label: string; value: TicketStatus | '' }[] = [
    { label: 'All statuses', value: '' },
    { label: 'Open', value: 'open' },
    { label: 'In progress', value: 'in_progress' },
    { label: 'Resolved', value: 'resolved' },
    { label: 'Closed', value: 'closed' }
  ];

  readonly navItems = [
    { label: 'Overview', icon: '▦', active: true },
    { label: 'All tickets', icon: '▤', active: false },
    { label: 'Customers', icon: '♙', active: false },
    { label: 'Reports', icon: '▥', active: false }
  ];

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;
    this.errorMessage = '';

    this.ticketService.getDashboardMetrics().subscribe({
      next: (response) => {
        this.metrics = response.data;
        this.loadTickets();
      },
      error: () => {
        this.loading = false;
        this.errorMessage =
          'Could not load dashboard metrics. Check that the backend is running.';
      }
    });
  }

  loadTickets(): void {
    this.ticketService.getTickets({
      page: this.currentPage,
      limit: this.pageSize,
      search: this.searchTerm,
      ...(this.selectedStatus
        ? { status: this.selectedStatus as TicketStatus }
        : {})
    }).subscribe({
      next: (response) => {
        this.tickets = response.data;
        this.totalTickets = response.pagination.total;
        this.totalPages = response.pagination.totalPages;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.errorMessage =
          'Could not load tickets. Please check the backend API.';
      }
    });
  }

  onSearchChange(): void {
    this.currentPage = 1;
    this.loadTickets();
  }

  onStatusChange(): void {
    this.currentPage = 1;
    this.loadTickets();
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadTickets();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadTickets();
    }
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('');
  }

  getCustomerColor(id: number): string {
    return `avatar-color-${(id % 5) + 1}`;
  }

  formatStatus(status: TicketStatus): string {
    return status === 'in_progress'
      ? 'In progress'
      : status.charAt(0).toUpperCase() + status.slice(1);
  }

  formatPriority(priority: TicketPriority): string {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  }

  trackTicket(_index: number, ticket: Ticket): number {
    return ticket.id;
  }
}


