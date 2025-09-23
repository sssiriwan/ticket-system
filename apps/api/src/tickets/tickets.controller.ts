import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { QueryTicketDto } from './dto/query-ticket.dto';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly service: TicketsService) {}
  @Post() create(@Body() dto: CreateTicketDto) {
    return this.service.create(dto);
  }
  @Get() async findAll(@Query() q: QueryTicketDto) {
    const page = q.page ?? 1,
      pageSize = q.pageSize ?? 10;
    const data = await this.service.findAll({ ...q, page, pageSize });
    return { ...data, page, pageSize };
  }
  @Get(':id') findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Patch(':id') update(@Param('id') id: string, @Body() dto: UpdateTicketDto) {
    return this.service.update(id, dto);
  }
  @Delete(':id') @HttpCode(204) remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
