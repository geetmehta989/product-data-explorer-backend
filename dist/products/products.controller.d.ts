import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { ProductsService } from './products.service';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    listByCategory(categoryId: string, q: PaginationQueryDto): Promise<{
        items: import("../entities/product.entity").Product[];
        total: number;
        page: number;
        pageSize: number;
    }>;
    getOne(id: string): Promise<import("../entities/product.entity").Product | null>;
}
