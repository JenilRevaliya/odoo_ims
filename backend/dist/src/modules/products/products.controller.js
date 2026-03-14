"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsController = void 0;
const products_service_1 = require("./products.service");
const zod_1 = require("zod");
const utils_1 = require("../../shared/utils");
const createProductSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    sku: zod_1.z.string().min(3),
    category: zod_1.z.string().min(1),
    unit_of_measure: zod_1.z.string().min(1),
    minimum_stock: zod_1.z.number().int().min(0).optional(),
    reorder_quantity: zod_1.z.number().int().min(0).optional(),
});
const updateProductSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).optional(),
    category: zod_1.z.string().min(1).optional(),
    unit_of_measure: zod_1.z.string().min(1).optional(),
    minimum_stock: zod_1.z.number().int().min(0).optional(),
    reorder_quantity: zod_1.z.number().int().min(0).optional(),
});
class ProductsController {
    static async list(req, res) {
        try {
            const filters = {
                category: req.query.category,
                status: req.query.filter,
                search: req.query.search,
                page: req.query.page ? parseInt(req.query.page, 10) : 1,
                per_page: req.query.per_page ? parseInt(req.query.per_page, 10) : 20,
            };
            const result = await products_service_1.ProductsService.list(filters);
            res.json({ success: true, ...result });
        }
        catch (err) {
            res.status(500).json({ success: false, error: { message: err.message } });
        }
    }
    static async getById(req, res) {
        try {
            const product = await products_service_1.ProductsService.getById((0, utils_1.paramStr)(req.params.id));
            if (!product)
                return res.status(404).json({ success: false, error: { message: 'Product not found' } });
            res.json({ success: true, data: product });
        }
        catch (err) {
            res.status(500).json({ success: false, error: { message: err.message } });
        }
    }
    static async searchBySku(req, res) {
        try {
            const sku = req.query.sku;
            if (!sku)
                return res.status(400).json({ success: false, error: { message: 'SKU query parameter required' } });
            const products = await products_service_1.ProductsService.searchBySku(sku);
            res.json({ success: true, data: products });
        }
        catch (err) {
            res.status(500).json({ success: false, error: { message: err.message } });
        }
    }
    static async create(req, res) {
        try {
            const data = createProductSchema.parse(req.body);
            const product = await products_service_1.ProductsService.create(data);
            res.status(201).json({ success: true, data: product });
        }
        catch (err) {
            const status = err.name === 'ZodError' ? 400 : 409;
            res.status(status).json({ success: false, error: { message: err.message } });
        }
    }
    static async update(req, res) {
        try {
            const data = updateProductSchema.parse(req.body);
            const product = await products_service_1.ProductsService.update((0, utils_1.paramStr)(req.params.id), data);
            res.json({ success: true, data: product });
        }
        catch (err) {
            const status = err.message === 'Product not found' ? 404 : 400;
            res.status(status).json({ success: false, error: { message: err.message } });
        }
    }
    static async delete(req, res) {
        try {
            await products_service_1.ProductsService.softDelete((0, utils_1.paramStr)(req.params.id));
            res.json({ success: true, data: { deleted: true } });
        }
        catch (err) {
            res.status(404).json({ success: false, error: { message: err.message } });
        }
    }
}
exports.ProductsController = ProductsController;
//# sourceMappingURL=products.controller.js.map