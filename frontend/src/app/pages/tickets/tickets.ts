
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  Ticket,
  TicketStatus
} from '../../models/ticket.model';
import { TicketService } from '../../services/ticket.service';

@Component({
  selector: 'app-tickets',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tickets.html',
  styleUrl: './tickets.scss'
})
export class Tickets implements OnInit {
  private readonly ticketService = inject(TicketService);

  tickets: Ticket[] = [];

  loading = true;
  errorMessage = '';

  searchTerm = '';
  statusFilter: TicketStatus | '' = '';

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

    this.ticketService.getTickets(options).subscribe({
      next: (response) => {
        this.tickets = response.data;
        this.totalTickets = response.pagination.total;
        this.totalPages = Math.max(
          response.pagination.totalPages,
          1
        );
        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to load tickets:', error);
        this.errorMessage =
          'Unable to load tickets. Check that the API is running and try again.';
        this.loading = false;
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

  formatLabel(value: string): string {
    return value
      .split('_')
      .map((part) =>
        part.charAt(0).toUpperCase() + part.slice(1)
      )
      .join(' ');
  }
}
