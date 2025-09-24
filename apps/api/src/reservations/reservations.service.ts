import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ReservationsService {
  private ttlSec = Number(process.env.RESERVATION_TTL_SECONDS ?? 600);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('reservations') private readonly queue: Queue,
  ) {}

  async create(userId: string, showId: string, seatIds: string[]) {
    if (seatIds.length === 0) throw new BadRequestException('seatIds empty');

    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1) map show × seats
      const inventories = await tx.seatInventory.findMany({
        where: { showId, seatId: { in: seatIds } },
        select: { id: true },
      });
      if (inventories.length !== seatIds.length) {
        throw new BadRequestException('Some seats not found for this show');
      }
      const invIds = inventories.map((x: { id: string }) => x.id);

      // 2) AVAILABLE -> HELD
      const upd = await tx.seatInventory.updateMany({
        where: { id: { in: invIds }, status: 'AVAILABLE' },
        data: { status: 'HELD' },
      });
      if (upd.count !== invIds.length) {
        throw new BadRequestException('Some seats already held/sold');
      }

      // 3) create reservation (+ items)
      const now = new Date();
      const expiresAt = new Date(now.getTime() + this.ttlSec * 1000);
      const reservation = await tx.reservation.create({
        data: {
          userId,
          showId,
          status: 'ACTIVE',
          expiresAt,
          items: { create: invIds.map((id: string) => ({ seatInventoryId: id })) },
        },
      });

      // 4) schedule expire job
      await this.queue.add(
        'expire-reservation',
        { reservationId: reservation.id },
        { delay: this.ttlSec * 1000, removeOnComplete: true, removeOnFail: true },
      );

      return { id: reservation.id, expiresAt };
    });
  }

  async getById(reservationId: string, userId: string) {
    const res = await this.prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        items: { include: { seatInventory: { include: { seat: true } } } },
      },
    });
    if (!res) throw new BadRequestException('Reservation not found');
    if (res.userId !== userId) throw new ForbiddenException();
    return res;
  }

  async cancel(reservationId: string, userId: string) {
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const res = await tx.reservation.findUnique({
        where: { id: reservationId },
        include: { items: true },
      });
      if (!res) throw new BadRequestException('Reservation not found');
      if (res.userId !== userId) throw new ForbiddenException();
      if (res.status !== 'ACTIVE') return res;

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

      return { ok: true };
    });
  }
}
