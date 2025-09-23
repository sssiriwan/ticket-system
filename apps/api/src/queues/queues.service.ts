import { Inject, Injectable } from '@nestjs/common';
import { NOTIFY_QUEUE, SLA_QUEUE } from './bullmq.module';
import { Queue, JobsOptions } from 'bullmq';
@Injectable()
export class QueuesService {
  constructor(
    @Inject(NOTIFY_QUEUE) private notify: Queue,
    @Inject(SLA_QUEUE) private sla: Queue,
  ) {}
  async enqueueOnCreate(ticketId: string) {
    const retry: JobsOptions = {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
    };
    await this.notify.add(
      'TicketNotifyJob',
      { ticketId },
      {
        jobId: `notify:${ticketId}`,
        ...retry,
        removeOnComplete: 50,
        removeOnFail: 100,
      },
    );
    await this.sla.add(
      'TicketSlaJob',
      { ticketId },
      {
        jobId: `sla:${ticketId}`,
        delay: 15 * 60 * 1000,
        removeOnComplete: true,
      },
    );
  }
  async removeSlaJob(ticketId: string) {
    const job = await this.sla.getJob(`sla:${ticketId}`);
    if (job) await job.remove();
  }
}
