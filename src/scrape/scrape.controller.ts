import { Controller, HttpCode, Post } from '@nestjs/common';
import { ApiAcceptedResponse, ApiTags } from '@nestjs/swagger';
import { ScrapeService } from './scrape.service';

@ApiTags('scrape')
@Controller('scrape')
export class ScrapeController {
  constructor(private readonly scrape: ScrapeService) {}

  @Post('refresh')
  @HttpCode(202)
  @ApiAcceptedResponse({ description: 'Enqueue scraping refresh job' })
  refresh() {
    return this.scrape.enqueueFullRefresh();
  }
}
