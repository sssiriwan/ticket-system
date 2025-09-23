import {
  IsEnum,
  IsNotEmpty,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';
enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}
export class CreateTicketDto {
  @IsString() @IsNotEmpty() @Length(5, 200) title!: string;
  @IsString() @IsNotEmpty() @MaxLength(5000) description!: string;
  @IsEnum(Priority) priority!: keyof typeof Priority;
}
