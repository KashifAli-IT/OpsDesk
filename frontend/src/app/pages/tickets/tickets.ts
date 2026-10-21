
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import {
  Ticket,
  TicketCreate,
  TicketPriority,
  TicketStatus
} from '../../models/ticket.model';
import { TicketService } from '../../services/ticket.service';

@Component({
  selector: 'app-tickets',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './tickets.html',
  styleUrl: './tickets.scss'
})
export class Tickets implements OnInit {
  private readonly ticketService = inject(TicketService);
  private readonly cdr = inject(ChangeDetectorRef);

  tickets: Ticket[] = [];
  showCreateForm = false;
  creatingTicket = false;
  successMessage = '';
  createErrorMessage = '';

  newTicket: TicketCreate = this.emptyTicketForm();

  private emptyTicketForm(): TicketCreate {
    return {
      title: '',
      customer_name: '',
      customer_email: '',
      description: '',
      priority: 'medium'
    };
  }

  loading = true;
  errorMessage = '';

  searchTerm = '';
  statusFilter: TicketStatus | '' = '';
  priorityFilter: TicketPriority | '' = '';
  currentPage = 1;
  pageSize = 10;
  totalTickets = 0;
  totalPages = 1;

  ngOnInit(): void {
    this.loadTickets();
  }

  loadTickets(): void {
    this.loading = true;
    this.errorMessage = '';

    const options: {
      page: number;
      limit: number;
      search?: string;
      status?: TicketStatus;
      priority?: TicketPriority;
    } = {
      page: this.currentPage,
      limit: this.pageSize
    };

    if (this.searchTerm.trim()) {
      options.search = this.searchTerm.trim();
    }

    if (this.statusFilter) {
      options.status = this.statusFilter;
    }

    if (this.priorityFilter) {
      options.priority = this.priorityFilter;
    }

    this.ticketService.getTickets(options).subscribe({
      next: (response) => {
        this.tickets = response.data;
        this.totalTickets = response.pagination.total;
        this.totalPages = Math.max(
          response.pagination.totalPages,
          1
        );
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Failed to load tickets:', error);
        this.errorMessage =
          'Unable to load tickets. Check that the API is running and try again.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.loadTickets();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.statusFilter = '';
    this.priorityFilter = '';
    this.currentPage = 1;
    this.loadTickets();
  }

  previousPage(): void {
    if (this.currentPage > 1 && !this.loading) {
      this.currentPage--;
      this.loadTickets();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages && !this.loading) {
      this.currentPage++;
      this.loadTickets();
    }
  }

  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
    this.createErrorMessage = '';
    this.successMessage = '';
  }

  createTicket(): void {
    if (this.creatingTicket) {
      return;
    }

    this.creatingTicket = true;
    this.createErrorMessage = '';
    this.successMessage = '';

    const payload: TicketCreate = {
      ...this.newTicket,
      title: this.newTicket.title.trim(),
      customer_name: this.newTicket.customer_name.trim(),
      customer_email: this.newTicket.customer_email.trim(),
      description: this.newTicket.description?.trim() || '',
      priority: this.newTicket.priority || 'medium'
    };

    this.ticketService.createTicket(payload).subscribe({
      next: (response) => {
        this.newTicket = this.emptyTicketForm();
        this.showCreateForm = false;
        this.creatingTicket = false;
        this.successMessage =
          `Ticket #${response.data.id} created successfully.`;

        this.searchTerm = '';
        this.statusFilter = '';
        this.priorityFilter = '';
        this.currentPage = 1;

        this.loadTickets();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Failed to create ticket:', error);

        this.createErrorMessage =
          error?.error?.details?.join(', ') ||
          error?.error?.error ||
          'Unable to create ticket. Check the API and try again.';

        this.creatingTicket = false;
        this.cdr.detectChanges();
      }
    });
  }

  formatLabel(value: string): string {
    return value
      .split('_')
      .map((part) =>
        part.charAt(0).toUpperCase() + part.slice(1)
      )
      .join(' ');
  }
}
