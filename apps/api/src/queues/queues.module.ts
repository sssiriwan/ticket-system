import { Module } from '@nestjs/common';
import { QueuesService } from './queues.service';
import { BullmqModule } from './bullmq.module';
import { QueuesController } from './queues.controller';
@Module({
  imports: [BullmqModule],
  providers: [QueuesService],
  controllers: [QueuesController],
  exports: [QueuesService],
})
export class QueuesModule {}
