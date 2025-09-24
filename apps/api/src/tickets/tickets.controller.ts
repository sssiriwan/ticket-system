import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly svc: TicketsService) {}

  @Post()
  create(@Body() dto: CreateTicketDto) {
    return this.svc.create(dto);
  }

  @Get()
  list(
    @Query('status') status?: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED',
    @Query('priority') priority?: 'LOW' | 'MEDIUM' | 'HIGH',
    @Query('search') search?: string,
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '10',
    @Query('sortBy')
    sortBy: 'createdAt' | 'updatedAt' | 'priority' | 'status' = 'createdAt',
    @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'desc',
  ) {
    return this.svc.findMany({
      status,
      priority,
      search,
      page: Number(page),
      pageSize: Number(pageSize),
      sortBy,
      sortOrder,
    });
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  @Patch(':id')
  patch(@Param('id') id: string, @Body() dto: UpdateTicketDto) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  del(@Param('id') id: string) {
    return this.svc.remove(id);
  }
}
