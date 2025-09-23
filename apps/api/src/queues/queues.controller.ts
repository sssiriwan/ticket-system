import { Controller, Get, Param } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { NOTIFY_QUEUE, SLA_QUEUE } from './bullmq.module';
import { Queue } from 'bullmq';
@Controller('admin/queues')
export class QueuesController {
  constructor(
    @Inject(NOTIFY_QUEUE) private notify: Queue,
    @Inject(SLA_QUEUE) private sla: Queue,
  ) {}
  @Get(':name/stats') async stats(@Param('name') name: string) {
    const q =
      name === 'notify' ? this.notify : name === 'sla' ? this.sla : null;
    if (!q) return { error: 'unknown queue' };
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      q.getWaitingCount(),
      q.getActiveCount(),
      q.getCompletedCount(),
      q.getFailedCount(),
      q.getDelayedCount(),
    ]);
    return { waiting, active, completed, failed, delayed };
  }
}
