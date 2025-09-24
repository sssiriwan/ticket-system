import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import type { Queue, JobsOptions } from 'bullmq';

@Injectable()
export class QueuesService {
  constructor(
    @InjectQueue('notify') private readonly notify: Queue,
    @InjectQueue('sla') private readonly sla: Queue,
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
        delay: Number(process.env.SLA_DELAY_MS ?? 15 * 60 * 1000),
        removeOnComplete: true,
      },
    );
  }

  async removeSlaJob(ticketId: string) {
    const job = await this.sla.getJob(`sla:${ticketId}`);
    if (job) await job.remove();
  }
}