export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

export type TicketStatus =
  | 'open'
  | 'in_progress'
  | 'resolved'
  | 'closed';

export interface Ticket {
  id: number;
  title: string;
  description: string;
  customer_name: string;
  customer_email: string;
  priority: TicketPriority;
  status: TicketStatus;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
}

export interface TicketPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface TicketsResponse {
  data: Ticket[];
  pagination: TicketPagination;
}

export interface DashboardMetrics {
  total_tickets: number;
  active_tickets: number;
  resolved_tickets: number;
  closed_tickets: number;
  by_status: Record<TicketStatus, number>;
  by_priority: Record<TicketPriority, number>;
}

export interface DashboardMetricsResponse {
  data: DashboardMetrics;
}

export interface TicketResponse {
  data: Ticket;
}

export interface TicketUpdate {
  status?: TicketStatus;
  priority?: TicketPriority;
  assigned_to?: string | null;
}

export interface TicketCreate {
  title: string;
  customer_name: string;
  customer_email: string;
  description?: string;
  priority?: TicketPriority;
  status?: TicketStatus;
  assigned_to?: string | null;
}
