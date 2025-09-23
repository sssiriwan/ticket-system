import { Global, Module } from '@nestjs/common';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';
export const REDIS = 'REDIS',
  NOTIFY_QUEUE = 'notifyQueue',
  SLA_QUEUE = 'slaQueue';
@Global()
@Module({
  providers: [
    { provide: REDIS, useFactory: () => new IORedis(process.env.REDIS_URL!) },
    {
      provide: NOTIFY_QUEUE,
      useFactory: (c: IORedis) => new Queue('notify', { connection: c }),
      inject: [REDIS],
    },
    {
      provide: SLA_QUEUE,
      useFactory: (c: IORedis) => new Queue('sla', { connection: c }),
      inject: [REDIS],
    },
  ],
  exports: [REDIS, NOTIFY_QUEUE, SLA_QUEUE],
})
export class BullmqModule {}
