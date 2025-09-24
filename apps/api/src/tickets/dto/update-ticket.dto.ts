import { PartialType } from '@nestjs/mapped-types';
import { CreateTicketDto } from './create-ticket.dto';
import { IsEnum, IsOptional } from 'class-validator';

export class UpdateTicketDto extends PartialType(CreateTicketDto) {
  @IsOptional()
  @IsEnum(['OPEN', 'IN_PROGRESS', 'RESOLVED'] as const)
  status?: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
}
