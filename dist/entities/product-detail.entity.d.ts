import { Product } from './product.entity';
export declare class ProductDetail {
    id: string;
    product: Product;
    productId: string;
    description: string | null;
    publisher: string | null;
    isbn: string | null;
    publicationDate: string | null;
    rating: string | null;
    reviewCount: number | null;
    metadata: Record<string, any> | null;
}
