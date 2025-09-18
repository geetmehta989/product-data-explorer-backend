import { CategoriesService } from './categories.service';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    byHeading(headingId: string): Promise<import("../entities/category.entity").Category[]>;
}
