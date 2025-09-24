import { Controller, Get, Param } from '@nestjs/common';
import { ShowsService } from './shows.service';

@Controller('shows')
export class ShowsController {
  constructor(private readonly shows: ShowsService) {}

  @Get(':id/price-tiers')
  tiers(@Param('id') id: string) {
    return this.shows.priceTiers(id);
  }

  @Get(':id/seat-map')
  seatMap(@Param('id') id: string) {
    return this.shows.seatMap(id);
  }
}
