import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async confirm(paymentId: string, userId: string) {
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const pay = await tx.payment.findUnique({
        where: { id: paymentId },
        include: {
          order: {
            include: {
              user: true,
              items: true,
              reservation: { include: { items: true } },
            },
          },
        },
      });
      if (!pay) throw new BadRequestException('Payment not found');
      if (pay.order.userId !== userId) throw new ForbiddenException();
      if (pay.status !== 'INIT') throw new BadRequestException('Payment already processed');

      type OrderItem = (typeof pay.order.items)[number];

      const invIds = pay.order.items.map((i: OrderItem) => i.seatInventoryId);
      const upd = await tx.seatInventory.updateMany({
        where: { id: { in: invIds }, status: 'HELD' },
        data: { status: 'SOLD' },
      });
      if (upd.count !== invIds.length) {
        throw new BadRequestException('Some seats are no longer held');
      }

      await tx.payment.update({
        where: { id: paymentId },
        data: { status: 'SUCCEEDED' },
      });

      await tx.order.update({
        where: { id: pay.orderId },
        data: { status: 'PAID' },
      });

      if (pay.order.reservation) {
        await tx.reservation.update({
          where: { id: pay.order.reservation.id },
          data: { status: 'CONFIRMED' },
        });
      }

      return { ok: true };
    });
  }
}
