"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScrapeModule = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const heading_entity_1 = require("../entities/heading.entity");
const category_entity_1 = require("../entities/category.entity");
const product_entity_1 = require("../entities/product.entity");
const product_detail_entity_1 = require("../entities/product-detail.entity");
const scrape_service_1 = require("./scrape.service");
const scrape_controller_1 = require("./scrape.controller");
const scrape_processor_1 = require("./scrape.processor");
const scraper_1 = require("./scraper");
let ScrapeModule = class ScrapeModule {
};
exports.ScrapeModule = ScrapeModule;
exports.ScrapeModule = ScrapeModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            typeorm_1.TypeOrmModule.forFeature([heading_entity_1.Heading, category_entity_1.Category, product_entity_1.Product, product_detail_entity_1.ProductDetail]),
            bullmq_1.BullModule.registerQueueAsync({
                name: 'scrape',
                inject: [config_1.ConfigService],
                useFactory: (cfg) => ({
                    connection: { url: cfg.get('REDIS_URL') },
                    defaultJobOptions: { attempts: 3, backoff: { type: 'exponential', delay: 3000 } },
                }),
            }),
        ],
        controllers: [scrape_controller_1.ScrapeController],
        providers: [scrape_service_1.ScrapeService, scrape_processor_1.ScrapeProcessor, scraper_1.Scraper],
    })
], ScrapeModule);
//# sourceMappingURL=scrape.module.js.map