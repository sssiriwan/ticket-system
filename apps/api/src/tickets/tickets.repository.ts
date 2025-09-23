import { PrismaService } from '../prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Injectable()
export class TicketsRepository {
  constructor(private prisma: PrismaService) {}
  async list(params: {
    status?: string;
    priority?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page: number;
    pageSize: number;
  }) {
    const {
      status,
      priority,
      search,
      sortBy = 'updatedAt',
      sortOrder = 'desc',
      page,
      pageSize,
    } = params;
    const where: Prisma.TicketWhereInput = {
      ...(status ? { status: status as any } : {}),
      ...(priority ? { priority: priority as any } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.ticket.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.ticket.count({ where }),
    ]);
    return { items, total };
  }
}
