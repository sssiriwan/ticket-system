import { Processor, WorkerHost } from '@nestjs/bullmq';
import type { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';

@Processor('sla')
export class SlaProcessor extends WorkerHost {
  constructor(private readonly prisma: PrismaService) { super(); }

  async process(job: Job<{ ticketId: string }>): Promise<void> {
    const t = await this.prisma.ticket.findUnique({ where: { id: job.data.ticketId } });
    if (!t) return;
    if (t.status !== 'RESOLVED') {
      console.warn('[TicketSlaJob] SLA maybe breached for ticket:', t.id);
    }
  }
}