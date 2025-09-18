import { Queue } from 'bullmq';
export declare class ScrapeService {
    private readonly queue;
    constructor(queue: Queue);
    enqueueFullRefresh(): Promise<{
        status: string;
    }>;
}
