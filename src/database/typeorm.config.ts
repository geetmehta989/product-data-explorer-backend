import { DataSourceOptions } from 'typeorm';
import { Heading } from '../entities/heading.entity';
import { Category } from '../entities/category.entity';
import { Product } from '../entities/product.entity';
import { ProductDetail } from '../entities/product-detail.entity';
import { Review } from '../entities/review.entity';

export function buildTypeOrmConfig(): DataSourceOptions {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set');
  }
  const isSsl = databaseUrl.includes('render.com') || databaseUrl.includes('fly.io');
  return {
    type: 'postgres',
    url: databaseUrl,
    ssl: isSsl ? { rejectUnauthorized: false } : false,
    entities: [Heading, Category, Product, ProductDetail, Review],
    synchronize: false,
    logging: process.env.TYPEORM_LOGGING === 'true',
  } as DataSourceOptions;
}
