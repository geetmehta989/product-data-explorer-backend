import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Heading } from '../entities/heading.entity';

@Injectable()
export class HeadingsService {
  constructor(@InjectRepository(Heading) private readonly headingsRepo: Repository<Heading>) {}

  async list(): Promise<Heading[]> {
    return this.headingsRepo.find({ order: { name: 'ASC' } });
  }
}
