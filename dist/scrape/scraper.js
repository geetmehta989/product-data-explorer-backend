"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var Scraper_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scraper = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const playwright_1 = require("@crawlee/playwright");
const heading_entity_1 = require("../entities/heading.entity");
const category_entity_1 = require("../entities/category.entity");
const product_entity_1 = require("../entities/product.entity");
const product_detail_entity_1 = require("../entities/product-detail.entity");
const BASE = 'https://www.worldofbooks.com/en-gb';
let Scraper = Scraper_1 = class Scraper {
    headings;
    categories;
    products;
    details;
    logger = new common_1.Logger(Scraper_1.name);
    constructor(headings, categories, products, details) {
        this.headings = headings;
        this.categories = categories;
        this.products = products;
        this.details = details;
    }
    async scrapeAll() {
        await this.scrapeHeadings();
        const cats = await this.categories.find();
        for (const cat of cats) {
            await this.scrapeCategoryProducts(cat);
        }
    }
    async scrapeHeadings() {
        const router = (0, playwright_1.createPlaywrightRouter)();
        router.addDefaultHandler(async ({ page, enqueueLinks, log }) => {
            await page.goto(BASE, { waitUntil: 'domcontentloaded' });
            const items = await page.$$eval('nav a', (as) => as
                .map((a) => ({
                name: (a.textContent || '').trim(),
                url: a.href,
            }))
                .filter((x) => x.name && x.url));
            for (const it of items) {
                const sourceId = new URL(it.url).pathname.replace(/\/$/, '');
                const slug = sourceId.split('/').filter(Boolean).pop() || it.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                const heading = await this.headings.findOne({ where: { sourceId } });
                if (!heading) {
                    const saved = await this.headings.save({ name: it.name, slug, sourceId });
                    await this.enqueueCategories(page, saved, it.url);
                }
                else {
                    if (heading.name !== it.name) {
                        heading.name = it.name;
                        await this.headings.save(heading);
                    }
                    await this.enqueueCategories(page, heading, it.url);
                }
            }
            await enqueueLinks({ selector: '' });
        });
        const crawler = new playwright_1.PlaywrightCrawler({ requestHandler: router });
        await crawler.run([BASE]);
    }
    async enqueueCategories(page, heading, url) {
        try {
            await page.goto(url, { waitUntil: 'domcontentloaded' });
            const cats = await page.$$eval('a', (as) => as
                .filter((a) => a.href.includes('/category'))
                .map((a) => ({ name: (a.textContent || '').trim(), url: a.href }))
                .filter((x) => x.name && x.url));
            for (const c of cats) {
                const sourceId = new URL(c.url).pathname.replace(/\/$/, '');
                const slug = sourceId.split('/').filter(Boolean).pop() || c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                const existing = await this.categories.findOne({ where: { sourceId } });
                if (!existing) {
                    await this.categories.save({ name: c.name, slug, sourceId, headingId: heading.id, url: c.url });
                }
                else {
                    existing.name = c.name;
                    existing.headingId = heading.id;
                    existing.url = c.url;
                    await this.categories.save(existing);
                }
            }
        }
        catch (e) {
            this.logger.warn(`Category extraction failed for ${url}: ${String(e)}`);
        }
    }
    async scrapeCategoryProducts(category) {
        const router = (0, playwright_1.createPlaywrightRouter)();
        router.addDefaultHandler(async ({ page, log }) => {
            await page.goto(category.url || `${BASE}${category.sourceId}`, { waitUntil: 'domcontentloaded' });
            const cards = await page.$$eval('[data-test-id="product-card"], .product-card, article', (els) => els.map((el) => {
                const title = (el.querySelector('h2, h3')?.textContent || '').trim();
                const author = (el.querySelector('.author, [data-test-id="author"]')?.textContent || '').trim() || null;
                const price = (el.querySelector('.price, [data-test-id="price"]')?.textContent || '').replace(/[^0-9.]/g, '');
                const img = el.querySelector('img')?.src || null;
                const link = el.querySelector('a')?.href || null;
                return { title, author, price, imageUrl: img, productUrl: link };
            }).filter((x) => x.title && x.productUrl));
            for (const c of cards) {
                const sourceId = new URL(c.productUrl).pathname.replace(/\/$/, '');
                const existing = await this.products.findOne({ where: { sourceId } });
                const record = existing || this.products.create({ sourceId });
                record.categoryId = category.id;
                record.title = c.title;
                record.author = c.author;
                record.price = c.price || null;
                record.imageUrl = c.imageUrl;
                record.productUrl = c.productUrl;
                await this.products.save(record);
            }
        });
        const crawler = new playwright_1.PlaywrightCrawler({ requestHandler: router, maxRequestsPerCrawl: 1 });
        await crawler.run([category.url || `${BASE}${category.sourceId}`]);
    }
    async scrapeProductDetail(product) {
        const router = (0, playwright_1.createPlaywrightRouter)();
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
            if (!detail)
                detail = this.details.create({ productId: product.id });
            detail.description = description;
            detail.publisher = publisher;
            detail.isbn = isbn;
            detail.publicationDate = publicationDate;
            detail.rating = rating;
            detail.reviewCount = reviewCount;
            await this.details.save(detail);
        });
        const crawler = new playwright_1.PlaywrightCrawler({ requestHandler: router, maxRequestsPerCrawl: 1 });
        await crawler.run([product.productUrl]);
    }
};
exports.Scraper = Scraper;
exports.Scraper = Scraper = Scraper_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(heading_entity_1.Heading)),
    __param(1, (0, typeorm_1.InjectRepository)(category_entity_1.Category)),
    __param(2, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __param(3, (0, typeorm_1.InjectRepository)(product_detail_entity_1.ProductDetail)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], Scraper);
//# sourceMappingURL=scraper.js.map