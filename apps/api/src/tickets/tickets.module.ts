import { Module } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { TicketsRepository } from './tickets.repository';
import { PrismaModule } from '../prisma/prisma.module';  
import { QueuesModule } from '../queues/queues.module';   

@Module({
  imports: [PrismaModule, QueuesModule], 
  controllers: [TicketsController],
  providers: [TicketsService, TicketsRepository],
  exports: [TicketsService],
})
export class TicketsModule {}
