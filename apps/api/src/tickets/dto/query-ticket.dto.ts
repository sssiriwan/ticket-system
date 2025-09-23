import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
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
export class QueryTicketDto {
  @IsOptional() @IsEnum(Status) status?: keyof typeof Status;
  @IsOptional() @IsEnum(Priority) priority?: keyof typeof Priority;
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsString() sortBy?:
    | 'createdAt'
    | 'updatedAt'
    | 'priority'
    | 'status';
  @IsOptional() @IsString() sortOrder?: 'asc' | 'desc';
  @IsOptional() @IsInt() @Min(1) page?: number;
  @IsOptional() @IsInt() @Min(1) pageSize?: number;
}
