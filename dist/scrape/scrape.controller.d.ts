import { ScrapeService } from './scrape.service';
export declare class ScrapeController {
    private readonly scrape;
    constructor(scrape: ScrapeService);
    refresh(): Promise<{
        status: string;
    }>;
}
