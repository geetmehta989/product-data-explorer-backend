import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlaywrightCrawler, createPlaywrightRouter } from '@crawlee/playwright';
import { Heading } from '../entities/heading.entity';
import { Category } from '../entities/category.entity';
import { Product } from '../entities/product.entity';
import { ProductDetail } from '../entities/product-detail.entity';

const BASE = 'https://www.worldofbooks.com/en-gb';

@Injectable()
export class Scraper {
  private readonly logger = new Logger(Scraper.name);
  constructor(
    @InjectRepository(Heading) private readonly headings: Repository<Heading>,
    @InjectRepository(Category) private readonly categories: Repository<Category>,
    @InjectRepository(Product) private readonly products: Repository<Product>,
    @InjectRepository(ProductDetail) private readonly details: Repository<ProductDetail>,
  ) {}

  async scrapeAll(): Promise<void> {
    await this.scrapeHeadings();
    const cats = await this.categories.find();
    for (const cat of cats) {
      await this.scrapeCategoryProducts(cat);
    }
  }

  async scrapeHeadings(): Promise<void> {
    const router = createPlaywrightRouter();
    router.addDefaultHandler(async ({ page, enqueueLinks, log }) => {
      await page.goto(BASE, { waitUntil: 'domcontentloaded' });
      const items = await page.$$eval('nav a', (as: any[]) =>
        as
          .map((a: any) => ({
            name: (a.textContent || '').trim(),
            url: (a as HTMLAnchorElement).href,
          }))
          .filter((x: any) => x.name && x.url)
      );
      for (const it of items) {
        const sourceId = new URL(it.url).pathname.replace(/\/$/, '');
        const slug = sourceId.split('/').filter(Boolean).pop() || it.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const heading = await this.headings.findOne({ where: { sourceId } });
        if (!heading) {
          const saved = await this.headings.save({ name: it.name, slug, sourceId });
          await this.enqueueCategories(page, saved, it.url);
        } else {
          if (heading.name !== it.name) {
            heading.name = it.name;
            await this.headings.save(heading);
          }
          await this.enqueueCategories(page, heading, it.url);
        }
      }
      await enqueueLinks({ selector: '' });
    });

    const crawler = new PlaywrightCrawler({ requestHandler: router });
    await crawler.run([BASE]);
  }

  private async enqueueCategories(page: any, heading: Heading, url: string) {
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      const cats = await page.$$eval('a', (as: any[]) =>
        as
          .filter((a: any) => (a as HTMLAnchorElement).href.includes('/category'))
          .map((a: any) => ({ name: (a.textContent || '').trim(), url: (a as HTMLAnchorElement).href }))
          .filter((x: any) => x.name && x.url)
      );
      for (const c of cats) {
        const sourceId = new URL(c.url).pathname.replace(/\/$/, '');
        const slug = sourceId.split('/').filter(Boolean).pop() || c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const existing = await this.categories.findOne({ where: { sourceId } });
        if (!existing) {
          await this.categories.save({ name: c.name, slug, sourceId, headingId: heading.id, url: c.url });
        } else {
          existing.name = c.name;
          existing.headingId = heading.id;
          existing.url = c.url;
          await this.categories.save(existing);
        }
      }
    } catch (e) {
      this.logger.warn(`Category extraction failed for ${url}: ${String(e)}`);
    }
  }

  async scrapeCategoryProducts(category: Category): Promise<void> {
    const router = createPlaywrightRouter();
    router.addDefaultHandler(async ({ page, log }) => {
      await page.goto(category.url || `${BASE}${category.sourceId}`, { waitUntil: 'domcontentloaded' });
      const cards = await page.$$eval('[data-test-id="product-card"], .product-card, article', (els) =>
        els.map((el: any) => {
          const title = (el.querySelector('h2, h3')?.textContent || '').trim();
          const author = (el.querySelector('.author, [data-test-id="author"]')?.textContent || '').trim() || null;
          const price = (el.querySelector('.price, [data-test-id="price"]')?.textContent || '').replace(/[^0-9.]/g, '');
          const img = (el.querySelector('img') as HTMLImageElement | null)?.src || null;
          const link = (el.querySelector('a') as HTMLAnchorElement | null)?.href || null;
          return { title, author, price, imageUrl: img, productUrl: link };
        }).filter((x: any) => x.title && x.productUrl)
      );
      for (const c of cards) {
        const sourceId = new URL(c.productUrl!).pathname.replace(/\/$/, '');
        const existing = await this.products.findOne({ where: { sourceId } });
        const record = existing || this.products.create({ sourceId });
        record.categoryId = category.id;
        record.title = c.title;
        record.author = c.author;
        record.price = c.price || null;
        record.imageUrl = c.imageUrl;
        record.productUrl = c.productUrl!;
        await this.products.save(record);
      }
    });
    const crawler = new PlaywrightCrawler({ requestHandler: router, maxRequestsPerCrawl: 1 });
    await crawler.run([category.url || `${BASE}${category.sourceId}`]);
  }

  async scrapeProductDetail(product: Product): Promise<void> {
    const router = createPlaywrightRouter();
    router.addDefaultHandler(async ({ page }) => {
      await page.goto(product.productUrl, { waitUntil: 'domcontentloaded' });
      const description = await page.$eval('article, [data-test-id="description"], #productDescription', (el) => el.textContent?.trim() || null).catch(() => null);
      const publisher = await page.$eval('li:has(strong:contains("Publisher"))', (el) => el.textContent?.split(':').slice(1).join(':').trim() || null).catch(() => null);
      const isbn = await page.$eval('li:has(strong:contains("ISBN"))', (el) => el.textContent?.replace(/[^0-9Xx-]/g, '').trim() || null).catch(() => null);
      const publicationDate = await page.$eval('li:has(strong:contains("Published"))', (el) => el.textContent?.split(':').slice(1).join(':').trim() || null).catch(() => null);
      const ratingText = await page.$eval('[data-test-id="rating"], .rating', (el) => el.textContent || '').catch(() => '');
      const rating = ratingText ? ratingText.replace(/[^0-9.]/g, '') : null;
      const reviewCountText = await page.$eval('[data-test-id="reviews-count"], .reviews-count', (el) => el.textContent || '').catch(() => '');
      const reviewCount = reviewCountText ? parseInt(reviewCountText.replace(/[^0-9]/g, ''), 10) : null;

      let detail = await this.details.findOne({ where: { productId: product.id } });
      if (!detail) detail = this.details.create({ productId: product.id });
      detail.description = description;
      detail.publisher = publisher;
      detail.isbn = isbn;
      detail.publicationDate = publicationDate as any;
      detail.rating = rating as any;
      detail.reviewCount = reviewCount as any;
      await this.details.save(detail);
    });
    const crawler = new PlaywrightCrawler({ requestHandler: router, maxRequestsPerCrawl: 1 });
    await crawler.run([product.productUrl]);
  }
}

