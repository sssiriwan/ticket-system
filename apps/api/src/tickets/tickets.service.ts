import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import type { Queue } from 'bullmq';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';

type ListQuery = {
  status?: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'priority' | 'status';
  sortOrder?: 'asc' | 'desc';
};

@Injectable()
export class TicketsService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('tickets') private readonly queue: Queue,
    @InjectQueue('notify') private readonly notifyQ: Queue,
    @InjectQueue('sla') private readonly slaQ: Queue,
  ) {}

  async create(dto: CreateTicketDto) {
    const t = await this.prisma.ticket.create({ data: dto });

    await this.notifyQ.add(
      'notify',
      { ticketId: t.id },
      {
        jobId: `notify:${t.id}`,
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: 50,
        removeOnFail: 100,
      },
    );

    await this.slaQ.add(
      'sla',
      { ticketId: t.id },
      {
        jobId: `sla:${t.id}`,
        delay: Number(process.env.SLA_DELAY_MS ?? 15 * 60 * 1000),
        removeOnComplete: 50,
        removeOnFail: 100,
      },
    );

    return t;
  }

  async findMany(q: ListQuery) {
    const {
      status,
      priority,
      search,
      page = 1,
      pageSize = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = q;

    const where: any = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.ticket.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.ticket.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  async findOne(id: string) {
    const t = await this.prisma.ticket.findUnique({ where: { id } });
    if (!t) throw new NotFoundException('Ticket not found');
    return t;
  }

  async update(id: string, dto: UpdateTicketDto) {
    await this.findOne(id);

    const t = await this.prisma.ticket.update({
      where: { id },
      data: dto,
    });

    if (dto.status === 'RESOLVED') {
      const job = await this.slaQ.getJob(`sla:${id}`);
      if (job) await job.remove();
    }

    return t;
  }

  async remove(id: string) {
    await this.prisma.ticket.delete({ where: { id } });
    for (const [q, jid] of [
      [this.notifyQ, `notify:${id}`],
      [this.slaQ, `sla:${id}`],
    ] as const) {
      const job = await q.getJob(jid);
      if (job) await job.remove();
    }
    return { ok: true };
  }
}
