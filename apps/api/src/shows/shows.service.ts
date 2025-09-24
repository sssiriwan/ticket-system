import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ShowsService {
  constructor(private readonly prisma: PrismaService) {}

  priceTiers(showId: string) {
    return this.prisma.priceTier.findMany({
      where: { showId },
      orderBy: { price: 'desc' },
    });
  }

  async seatMap(showId: string) {
    const show = await this.prisma.showTime.findUnique({
      where: { id: showId },
      include: {
        venue: {
          include: {
            sections: {
              include: {
                seats: {
                  select: { id: true, row: true, number: true },
                },
              },
            },
          },
        },
      },
    });
    if (!show) return null;

    const inventories = await this.prisma.seatInventory.findMany({
      where: { showId },
      select: { id: true, seatId: true, status: true, priceTierId: true },
    });
    type Inv = (typeof inventories)[number];

    const invBySeat = new Map<string, Inv>(
      inventories.map((i: Inv) => [i.seatId, i]),
    );

    // sections + type helpers
    const sections = show.venue.sections;

    return {
      showId,
      venue: {
        id: show.venueId,
        name: show.venue.name,
        sections: sections.map((sec: (typeof sections)[number]) => ({
          id: sec.id,
          name: sec.name,
          seats: sec.seats.map((s: (typeof sec.seats)[number]) => ({
            id: s.id,
            row: s.row,
            number: s.number,
            inventory: invBySeat.get(s.id) ?? null,
          })),
        })),
      },
    };
  }
}
