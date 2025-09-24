import { IsEnum, IsString, MinLength, MaxLength } from 'class-validator';

export class CreateTicketDto {
  @IsString()
  @MinLength(5)
  title!: string;

  @IsString()
  @MaxLength(5000)
  description!: string;

  @IsEnum(['LOW', 'MEDIUM', 'HIGH'] as const)
  priority!: 'LOW' | 'MEDIUM' | 'HIGH';
}
