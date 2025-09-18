import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get('by-heading/:headingId')
  @ApiOkResponse({ description: 'List categories by heading' })
  byHeading(@Param('headingId') headingId: string) {
    return this.categoriesService.byHeading(headingId);
  }
}
