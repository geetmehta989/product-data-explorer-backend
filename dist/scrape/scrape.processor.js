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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScrapeProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const scraper_1 = require("./scraper");
const common_1 = require("@nestjs/common");
let ScrapeProcessor = class ScrapeProcessor extends bullmq_1.WorkerHost {
    scraper;
    constructor(scraper) {
        super();
        this.scraper = scraper;
    }
    async process(job) {
        if (job.name === 'full-refresh') {
            await this.scraper.scrapeAll();
        }
        return { done: true };
    }
};
exports.ScrapeProcessor = ScrapeProcessor;
exports.ScrapeProcessor = ScrapeProcessor = __decorate([
    (0, common_1.Injectable)(),
    (0, bullmq_1.Processor)('scrape'),
    __metadata("design:paramtypes", [scraper_1.Scraper])
], ScrapeProcessor);
//# sourceMappingURL=scrape.processor.js.map