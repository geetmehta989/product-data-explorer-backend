import { Product } from './product.entity';
export declare class Review {
    id: string;
    product: Product;
    productId: string;
    author: string | null;
    rating: string | null;
    content: string;
    createdAt: Date;
}
