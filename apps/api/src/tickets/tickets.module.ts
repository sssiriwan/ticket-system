import { Module } from '@nestjs/common';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { PrismaService } from '../prisma/prisma.service';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [BullModule.registerQueue({ name: 'tickets' })],
  controllers: [TicketsController],
  providers: [PrismaService, TicketsService],
  exports: [TicketsService],
})
export class TicketsModule {}
