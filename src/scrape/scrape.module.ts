import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Heading } from '../entities/heading.entity';
import { Category } from '../entities/category.entity';
import { Product } from '../entities/product.entity';
import { ProductDetail } from '../entities/product-detail.entity';
import { ScrapeService } from './scrape.service';
import { ScrapeController } from './scrape.controller';
import { ScrapeProcessor } from './scrape.processor';
import { Scraper } from './scraper';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Heading, Category, Product, ProductDetail]),
    BullModule.registerQueueAsync({
      name: 'scrape',
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        connection: { url: cfg.get<string>('REDIS_URL')! },
        defaultJobOptions: { attempts: 3, backoff: { type: 'exponential', delay: 3000 } },
      }),
    }),
  ],
  controllers: [ScrapeController],
  providers: [ScrapeService, ScrapeProcessor, Scraper],
})
export class ScrapeModule {}
