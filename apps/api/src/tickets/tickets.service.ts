import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { TicketsRepository } from './tickets.repository';
import { QueuesService } from '../queues/queues.service';

@Injectable()
export class TicketsService {
  constructor(
    private prisma: PrismaService,
    private repo: TicketsRepository,
    private queues: QueuesService,
  ) {}
  async create(dto: CreateTicketDto) {
    const t = await this.prisma.ticket.create({
      data: { ...dto, status: 'OPEN' },
    });
    await this.queues.enqueueOnCreate(t.id);
    return t;
  }
  findAll(query: any) {
    return this.repo.list(query);
  }
  async findOne(id: string) {
    const t = await this.prisma.ticket.findUnique({ where: { id } });
    if (!t) throw new NotFoundException('Ticket not found');
    return t;
  }
  async update(id: string, dto: UpdateTicketDto) {
    const before = await this.findOne(id);
    const updated = await this.prisma.ticket.update({
      where: { id },
      data: dto,
    });
    if (dto.status === 'RESOLVED' && before.status !== 'RESOLVED')
      await this.queues.removeSlaJob(id);
    return updated;
  }
  async remove(id: string) {
    await this.prisma.ticket.delete({ where: { id } });
    await this.queues.removeSlaJob(id);
    return { ok: true };
  }
}
