import {
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async createFromReservation(userId: string, reservationId: string) {
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const reservation = await tx.reservation.findUnique({
        where: { id: reservationId },
        include: {
          items: {
            include: {
              seatInventory: { include: { priceTier: true } },
            },
          },
        },
      });

      if (!reservation) throw new BadRequestException('Reservation not found');
      if (reservation.userId !== userId) throw new ForbiddenException();
      if (reservation.status !== 'ACTIVE')
        throw new BadRequestException('Reservation is not active');
      if (reservation.expiresAt.getTime() < Date.now())
        throw new BadRequestException('Reservation expired');

      type ResItem = (typeof reservation.items)[number];

      const total = reservation.items.reduce((sum: Decimal, it: ResItem) => {
        const p = it.seatInventory.priceTier?.price ?? new Decimal(0);
        return sum.plus(p);
      }, new Decimal(0));

      const order = await tx.order.create({
        data: {
          userId,
          showId: reservation.showId,
          status: 'PENDING',
          totalAmount: total,
          reservationId: reservation.id,
          items: {
            create: reservation.items.map(
              (it: (typeof reservation.items)[number]) => ({
                seatInventoryId: it.seatInventoryId,
                price: it.seatInventory.priceTier?.price ?? new Decimal(0),
              }),
            ),
          },
          payment: {
            create: {
              provider: 'mock',
              status: 'INIT',
              amount: total,
            },
          },
        },
        include: { payment: true },
      });

      return order;
    });
  }
}
