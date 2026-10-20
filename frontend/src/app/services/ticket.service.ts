
import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  DashboardMetricsResponse,
  TicketsResponse,
  TicketPriority,
  TicketStatus
} from '../models/ticket.model';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/api';

  getDashboardMetrics(): Observable<DashboardMetricsResponse> {
    return this.http.get<DashboardMetricsResponse>(
      `${this.apiUrl}/dashboard/metrics`
    );
  }

  getTickets(options?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: TicketStatus;
    priority?: TicketPriority;
  }): Observable<TicketsResponse> {
    let params = new HttpParams();

    if (options?.page !== undefined) {
      params = params.set('page', options.page);
    }

    if (options?.limit !== undefined) {
      params = params.set('limit', options.limit);
    }

    if (options?.search?.trim()) {
      params = params.set('search', options.search.trim());
    }

    if (options?.status) {
      params = params.set('status', options.status);
    }

    if (options?.priority) {
      params = params.set('priority', options.priority);
    }

    return this.http.get<TicketsResponse>(
      `${this.apiUrl}/tickets`,
      { params }
    );
  }
}
