import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import { ProductDetail } from '../entities/product-detail.entity';
export declare class ProductsService {
    private readonly productsRepo;
    private readonly detailsRepo;
    constructor(productsRepo: Repository<Product>, detailsRepo: Repository<ProductDetail>);
    listByCategory(categoryId: string, page: number, pageSize: number): Promise<{
        items: Product[];
        total: number;
        page: number;
        pageSize: number;
    }>;
    findOne(id: string): Promise<Product | null>;
}
