import { Repository } from 'typeorm';
import { Category } from '../entities/category.entity';
export declare class CategoriesService {
    private readonly categoriesRepo;
    constructor(categoriesRepo: Repository<Category>);
    byHeading(headingId: string): Promise<Category[]>;
    findOne(id: string): Promise<Category>;
}
