export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';
export type Status = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';

export interface Ticket {
  id: string;
  title: string;
  description: string | null;
  priority: Priority;
  status: Status;
  createdAt: string; 
  updatedAt: string; 
}

export interface TicketListResponse {
  items: Ticket[];
  total: number;
  page: number;
  pageSize: number;
}
