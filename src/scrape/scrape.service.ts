import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class ScrapeService {
  constructor(@InjectQueue('scrape') private readonly queue: Queue) {}

  async enqueueFullRefresh() {
    await this.queue.add('full-refresh', {}, { removeOnComplete: true, removeOnFail: 100 });
    return { status: 'queued' };
  }
}
