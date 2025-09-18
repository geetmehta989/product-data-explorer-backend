import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Scraper } from './scraper';
import { Injectable } from '@nestjs/common';

@Injectable()
@Processor('scrape')
export class ScrapeProcessor extends WorkerHost {
  constructor(private readonly scraper: Scraper) { super(); }

  async process(job: Job): Promise<any> {
    if (job.name === 'full-refresh') {
      await this.scraper.scrapeAll();
    }
    return { done: true };
  }
}
