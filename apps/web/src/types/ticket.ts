export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';
export type Status = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';

export type Ticket = {
  id: string;
  title: string;
  description?: string | null;
  priority: Priority;
  status: Status;
  createdAt: string; 
  updatedAt: string; 
};

export type TicketList = {
  items: Ticket[];
  total: number;
  page: number;
  pageSize: number;
};
