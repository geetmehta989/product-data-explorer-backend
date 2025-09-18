import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import { ProductDetail } from '../entities/product-detail.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private readonly productsRepo: Repository<Product>,
    @InjectRepository(ProductDetail) private readonly detailsRepo: Repository<ProductDetail>,
  ) {}

  async listByCategory(categoryId: string, page: number, pageSize: number) {
    const [items, total] = await this.productsRepo.findAndCount({
      where: { categoryId },
      order: { title: 'ASC' },
      take: pageSize,
      skip: (page - 1) * pageSize,
    });
    return { items, total, page, pageSize };
  }

  async findOne(id: string) {
    return this.productsRepo.findOne({ where: { id }, relations: { detail: true } });
  }
}
