import { Module } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { ReservationsController } from './reservations.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { BullModule } from '@nestjs/bullmq';
import { ReservationProcessor } from './reservation.processor';

@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueue({ name: 'reservations' }), 
  ],
  controllers: [ReservationsController],
  providers: [ReservationsService, ReservationProcessor],
  exports: [ReservationsService],
})
export class ReservationsModule {}
