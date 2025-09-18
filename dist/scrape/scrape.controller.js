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
exports.ScrapeController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const scrape_service_1 = require("./scrape.service");
let ScrapeController = class ScrapeController {
    scrape;
    constructor(scrape) {
        this.scrape = scrape;
    }
    refresh() {
        return this.scrape.enqueueFullRefresh();
    }
};
exports.ScrapeController = ScrapeController;
__decorate([
    (0, common_1.Post)('refresh'),
    (0, common_1.HttpCode)(202),
    (0, swagger_1.ApiAcceptedResponse)({ description: 'Enqueue scraping refresh job' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ScrapeController.prototype, "refresh", null);
exports.ScrapeController = ScrapeController = __decorate([
    (0, swagger_1.ApiTags)('scrape'),
    (0, common_1.Controller)('scrape'),
    __metadata("design:paramtypes", [scrape_service_1.ScrapeService])
], ScrapeController);
//# sourceMappingURL=scrape.controller.js.map