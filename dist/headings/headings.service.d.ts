import { Repository } from 'typeorm';
import { Heading } from '../entities/heading.entity';
export declare class HeadingsService {
    private readonly headingsRepo;
    constructor(headingsRepo: Repository<Heading>);
    list(): Promise<Heading[]>;
}
