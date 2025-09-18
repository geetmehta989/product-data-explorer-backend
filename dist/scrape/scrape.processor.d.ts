import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Scraper } from './scraper';
export declare class ScrapeProcessor extends WorkerHost {
    private readonly scraper;
    constructor(scraper: Scraper);
    process(job: Job): Promise<any>;
}
