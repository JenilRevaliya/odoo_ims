"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockLedgerService = void 0;
const db_1 = __importDefault(require("../../config/db"));
class StockLedgerService {
    static async list(filters) {
        const page = filters.page || 1;
        const perPage = filters.per_page || 30;
        const offset = (page - 1) * perPage;
        let query = (0, db_1.default)('stock_ledger as sl')
            .select('sl.*', 'p.name as product_name', 'p.sku', 'l.name as location_name', 'u.name as user_name', 'o.reference_number')
            .join('products as p', 'sl.product_id', 'p.id')
            .join('locations as l', 'sl.location_id', 'l.id')
            .join('users as u', 'sl.user_id', 'u.id')
            .join('operations as o', 'sl.operation_id', 'o.id');
        if (filters.product_id)
            query = query.where('sl.product_id', filters.product_id);
        if (filters.location_id)
            query = query.where('sl.location_id', filters.location_id);
        if (filters.operation_type)
            query = query.where('sl.operation_type', filters.operation_type);
        if (filters.from)
            query = query.where('sl.created_at', '>=', filters.from);
        if (filters.to)
            query = query.where('sl.created_at', '<=', filters.to);
        const countResult = await query.clone().clearSelect().clearOrder().count('sl.id as count').first();
        const total = parseInt(countResult?.count, 10) || 0;
        const entries = await query.orderBy('sl.created_at', 'desc').limit(perPage).offset(offset);
        return {
            data: entries,
            meta: { page, per_page: perPage, total, total_pages: Math.ceil(total / perPage) },
        };
    }
}
exports.StockLedgerService = StockLedgerService;
//# sourceMappingURL=stock-ledger.service.js.map