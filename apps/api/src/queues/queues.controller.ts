import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Controller('admin/queues')
export class QueuesController {
  constructor(
    @InjectQueue('notify') private readonly notifyQueue: Queue,
    @InjectQueue('sla') private readonly slaQueue: Queue,
  ) {}

  @Get(':name/stats')
  async stats(@Param('name') name: string) {
    const q =
      name === 'notify'
        ? this.notifyQueue
        : name === 'sla'
          ? this.slaQueue
          : null;

    if (!q) throw new NotFoundException(`unknown queue: ${name}`);

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
