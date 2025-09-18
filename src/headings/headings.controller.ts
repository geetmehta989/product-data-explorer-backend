import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { HeadingsService } from './headings.service';

@ApiTags('headings')
@Controller('headings')
export class HeadingsController {
  constructor(private readonly headingsService: HeadingsService) {}

  @Get()
  @ApiOkResponse({ description: 'List navigation headings' })
  list() {
    return this.headingsService.list();
  }
}
