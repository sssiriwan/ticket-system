// apps/api/src/orders/dto/create-order.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  reservationId!: string;
}
