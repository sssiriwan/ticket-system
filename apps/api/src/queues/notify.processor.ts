import { Processor, WorkerHost } from '@nestjs/bullmq';
import type { Job } from 'bullmq';

@Processor('notify')
export class NotifyProcessor extends WorkerHost {
  async process(job: Job<{ ticketId: string }>): Promise<void> {
    console.log('[TicketNotifyJob]', job.id, job.data.ticketId);
  }
}
