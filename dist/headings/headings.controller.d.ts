import { HeadingsService } from './headings.service';
export declare class HeadingsController {
    private readonly headingsService;
    constructor(headingsService: HeadingsService);
    list(): Promise<import("../entities/heading.entity").Heading[]>;
}
