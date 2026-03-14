"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsService = void 0;
const db_1 = __importDefault(require("../../config/db"));
const uuid_1 = require("uuid");
class ProductsService {
    static async list(filters) {
        const page = filters.page || 1;
        const perPage = filters.per_page || 20;
        const offset = (page - 1) * perPage;
        let query = (0, db_1.default)('products')
            .select('products.*', db_1.default.raw('COALESCE(SUM(sb.quantity), 0)::int as total_stock'))
            .leftJoin('stock_balances as sb', 'products.id', 'sb.product_id')
            .where('products.is_deleted', false)
            .groupBy('products.id');
        if (filters.category) {
            query = query.where('products.category', filters.category);
        }
        if (filters.search) {
            query = query.where(function () {
                this.whereILike('products.name', `%${filters.search}%`)
                    .orWhereILike('products.sku', `%${filters.search}%`);
            });
        }
        if (filters.status === 'low_stock') {
            query = query.havingRaw('COALESCE(SUM(sb.quantity), 0) <= products.minimum_stock AND COALESCE(SUM(sb.quantity), 0) > 0');
        }
        else if (filters.status === 'out_of_stock') {
            query = query.havingRaw('COALESCE(SUM(sb.quantity), 0) = 0');
        }
        // Count total before pagination
        const countQuery = query.clone();
        const countResult = await db_1.default.raw(`SELECT COUNT(*) FROM (${countQuery.toQuery()}) as count_table`);
        const total = parseInt(countResult.rows[0].count, 10);
        const products = await query.orderBy('products.name', 'asc').limit(perPage).offset(offset);
        return {
            data: products,
            meta: {
                page,
                per_page: perPage,
                total,
                total_pages: Math.ceil(total / perPage),
            },
        };
    }
    static async getById(id) {
        const product = await (0, db_1.default)('products').where({ id, is_deleted: false }).first();
        if (!product)
            return null;
        const stockByLocation = await (0, db_1.default)('stock_balances as sb')
            .select('sb.location_id', 'l.name as location', 'sb.quantity')
            .join('locations as l', 'sb.location_id', 'l.id')
            .where('sb.product_id', id);
        return { ...product, total_stock: stockByLocation.reduce((sum, s) => sum + s.quantity, 0), stock_by_location: stockByLocation };
    }
    static async searchBySku(sku) {
        return (0, db_1.default)('products')
            .select('*')
            .whereILike('sku', `%${sku}%`)
            .andWhere('is_deleted', false)
            .limit(10);
    }
    static async create(data) {
        // Validate SKU uniqueness
        const existing = await (0, db_1.default)('products').where({ sku: data.sku }).first();
        if (existing) {
            throw new Error('SKU already exists');
        }
        // Validate SKU format: letters-numbers pattern
        if (!/^[A-Z]{2,5}-\d{3,5}$/i.test(data.sku)) {
            throw new Error('SKU must follow format: ABC-001 (2-5 letters, dash, 3-5 digits)');
        }
        const id = (0, uuid_1.v4)();
        const [product] = await (0, db_1.default)('products')
            .insert({
            id,
            name: data.name,
            sku: data.sku.toUpperCase(),
            category: data.category,
            unit_of_measure: data.unit_of_measure,
            minimum_stock: data.minimum_stock || 0,
            reorder_quantity: data.reorder_quantity || 0,
        })
            .returning('*');
        return product;
    }
    static async update(id, data) {
        const existing = await (0, db_1.default)('products').where({ id, is_deleted: false }).first();
        if (!existing)
            throw new Error('Product not found');
        const [updated] = await (0, db_1.default)('products')
            .where({ id })
            .update({ ...data, updated_at: db_1.default.fn.now() })
            .returning('*');
        return updated;
    }
    static async softDelete(id) {
        const existing = await (0, db_1.default)('products').where({ id, is_deleted: false }).first();
        if (!existing)
            throw new Error('Product not found');
        await (0, db_1.default)('products').where({ id }).update({ is_deleted: true, updated_at: db_1.default.fn.now() });
        return { deleted: true };
    }
}
exports.ProductsService = ProductsService;
//# sourceMappingURL=products.service.js.map