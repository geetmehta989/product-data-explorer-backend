import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { ProductsService } from './products.service';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('by-category/:categoryId')
  @ApiOkResponse({ description: 'List products by category' })
  listByCategory(@Param('categoryId') categoryId: string, @Query() q: PaginationQueryDto) {
    return this.productsService.listByCategory(categoryId, q.page ?? 1, q.pageSize ?? 24);
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Get product detail' })
  getOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }
}
