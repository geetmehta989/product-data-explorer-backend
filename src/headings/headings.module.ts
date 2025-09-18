import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Heading } from '../entities/heading.entity';
import { HeadingsService } from './headings.service';
import { HeadingsController } from './headings.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Heading])],
  controllers: [HeadingsController],
  providers: [HeadingsService],
  exports: [HeadingsService],
})
export class HeadingsModule {}
