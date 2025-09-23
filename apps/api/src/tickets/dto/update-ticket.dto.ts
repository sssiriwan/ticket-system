import { PartialType } from '@nestjs/mapped-types';
import { CreateTicketDto } from './create-ticket.dto';
import { IsEnum, IsOptional } from 'class-validator';
enum Status {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
}
enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}
export class UpdateTicketDto extends PartialType(CreateTicketDto) {
  @IsOptional() @IsEnum(Status) status?: keyof typeof Status;
  @IsOptional() @IsEnum(Priority) priority?: keyof typeof Priority;
}
