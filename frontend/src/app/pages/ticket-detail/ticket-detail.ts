
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import {
  Ticket,
  TicketStatus
} from '../../models/ticket.model';

import { TicketService } from '../../services/ticket.service';

@Component({
  selector: 'app-ticket-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './ticket-detail.html',
  styleUrl: './ticket-detail.scss'
})
export class TicketDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly ticketService = inject(TicketService);
  private readonly cdr = inject(ChangeDetectorRef);

  ticket: Ticket | null = null;

  selectedStatus: TicketStatus = 'open';

  loading = true;
  saving = false;

  errorMessage = '';
  successMessage = '';

  readonly statusOptions: {
    value: TicketStatus;
    label: string;
  }[] = [
    { value: 'open', label: 'Open' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'closed', label: 'Closed' }
  ];

  ngOnInit(): void {

    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!Number.isInteger(id) || id <= 0) {
      this.loading = false;
      this.errorMessage = 'Invalid ticket ID.';
      return;
    }

    this.loadTicket(id);
  }

  loadTicket(id: number): void {

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.ticketService.getTicket(id).subscribe({
      next: (response) => {

        this.ticket = response.data;
        this.selectedStatus = response.data.status;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {

        this.ticket = null;
        this.loading = false;
        this.cdr.detectChanges();

        this.errorMessage =
          error.status === 404
            ? 'Ticket not found.'
            : 'Unable to load this ticket. Please try again.';
      }
    });
  }

  saveStatus(): void {
    if (!this.ticket || this.saving) {
      return;
    }

    if (this.selectedStatus === this.ticket.status) {
      this.successMessage = '';
      this.errorMessage = 'Choose a different status before saving.';
      return;
    }

    this.saving = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.ticketService.updateTicket(this.ticket.id, {
      status: this.selectedStatus
    }).subscribe({
      next: (response) => {
        this.ticket = response.data;
        this.selectedStatus = response.data.status;
        this.saving = false;
        this.successMessage = 'Ticket status updated successfully.';
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.saving = false;
        this.cdr.detectChanges();

        this.errorMessage =
          error.status === 404
            ? 'This ticket no longer exists.'
            : error.error?.message ||
              'Unable to update the ticket status. Please try again.';
      }
    });
  }

  formatLabel(value: string): string {
    return value
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
