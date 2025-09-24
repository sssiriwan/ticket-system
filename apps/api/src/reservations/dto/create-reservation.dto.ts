import { IsArray, IsNotEmpty, IsString, ArrayNotEmpty } from 'class-validator';

export class CreateReservationDto {
  @IsString()
  @IsNotEmpty()
  showId!: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  seatIds!: string[];
}
