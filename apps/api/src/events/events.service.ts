import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.event.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  shows(eventId: string) {
    return this.prisma.showTime.findMany({
      where: { eventId },
      orderBy: { startsAt: 'asc' },
    });
  }
}
