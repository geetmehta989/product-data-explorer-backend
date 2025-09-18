"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildTypeOrmConfig = buildTypeOrmConfig;
const heading_entity_1 = require("../entities/heading.entity");
const category_entity_1 = require("../entities/category.entity");
const product_entity_1 = require("../entities/product.entity");
const product_detail_entity_1 = require("../entities/product-detail.entity");
const review_entity_1 = require("../entities/review.entity");
function buildTypeOrmConfig() {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
        throw new Error('DATABASE_URL is not set');
    }
    const isSsl = databaseUrl.includes('render.com') || databaseUrl.includes('fly.io');
    return {
        type: 'postgres',
        url: databaseUrl,
        ssl: isSsl ? { rejectUnauthorized: false } : false,
        entities: [heading_entity_1.Heading, category_entity_1.Category, product_entity_1.Product, product_detail_entity_1.ProductDetail, review_entity_1.Review],
        synchronize: false,
        logging: process.env.TYPEORM_LOGGING === 'true',
    };
}
//# sourceMappingURL=typeorm.config.js.map