import { Repository } from 'typeorm';
import { Heading } from '../entities/heading.entity';
import { Category } from '../entities/category.entity';
import { Product } from '../entities/product.entity';
import { ProductDetail } from '../entities/product-detail.entity';
export declare class Scraper {
    private readonly headings;
    private readonly categories;
    private readonly products;
    private readonly details;
    private readonly logger;
    constructor(headings: Repository<Heading>, categories: Repository<Category>, products: Repository<Product>, details: Repository<ProductDetail>);
    scrapeAll(): Promise<void>;
    scrapeHeadings(): Promise<void>;
    private enqueueCategories;
    scrapeCategoryProducts(category: Category): Promise<void>;
    scrapeProductDetail(product: Product): Promise<void>;
}
