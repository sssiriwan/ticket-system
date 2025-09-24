import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import type { QueueOptions } from 'bullmq';

@Global()
@Module({
  imports: [
    ConfigModule,
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => {
        const url = cfg.get<string>('REDIS_URL') ?? 'redis://localhost:6379';
        return {
          connection: {
            maxRetriesPerRequest: null,
            enableReadyCheck: false,
            url,
          },
        } satisfies QueueOptions;
      },
    }),
    BullModule.registerQueue({ name: 'reservations' }),
  ],
  exports: [BullModule],
})
export class QueuesModule {}
