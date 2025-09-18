import { Category } from './category.entity';
import { ProductDetail } from './product-detail.entity';
export declare class Product {
    id: string;
    category: Category;
    categoryId: string | null;
    title: string;
    author: string | null;
    price: string | null;
    imageUrl: string | null;
    productUrl: string;
    sourceId: string;
    detail?: ProductDetail;
}
