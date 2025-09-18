import { Heading } from './heading.entity';
import { Product } from './product.entity';
export declare class Category {
    id: string;
    heading: Heading;
    headingId: string;
    name: string;
    slug: string;
    url: string | null;
    sourceId: string;
    products: Product[];
}
