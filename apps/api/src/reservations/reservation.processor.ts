import { Processor, WorkerHost } from '@nestjs/bullmq';
import type { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Processor('reservations')
export class ReservationProcessor extends WorkerHost {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job<{ reservationId: string }>): Promise<void> {
    const { reservationId } = job.data;

    await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const res = await tx.reservation.findUnique({
        where: { id: reservationId },
        include: { items: true },
      });
      if (!res) return;
      if (res.status !== 'ACTIVE') return;

      if (res.expiresAt && res.expiresAt.getTime() > Date.now()) return;

      await tx.reservation.update({
        where: { id: reservationId },
        data: { status: 'EXPIRED' },
      });

      type ResItem = (typeof res.items)[number];

      const invIds = res.items.map((i: ResItem) => i.seatInventoryId);
      await tx.seatInventory.updateMany({
        where: { id: { in: invIds }, status: 'HELD' },
        data: { status: 'AVAILABLE' },
      });
    });
  }
}
