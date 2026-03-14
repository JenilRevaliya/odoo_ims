"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockLedgerController = void 0;
const stock_ledger_service_1 = require("./stock-ledger.service");
class StockLedgerController {
    static async list(req, res) {
        try {
            const filters = {
                product_id: req.query.product_id,
                location_id: req.query.location_id,
                operation_type: req.query.type,
                from: req.query.from,
                to: req.query.to,
                page: req.query.page ? parseInt(req.query.page, 10) : 1,
                per_page: req.query.per_page ? parseInt(req.query.per_page, 10) : 30,
            };
            const result = await stock_ledger_service_1.StockLedgerService.list(filters);
            res.json({ success: true, ...result });
        }
        catch (err) {
            res.status(500).json({ success: false, error: { message: err.message } });
        }
    }
}
exports.StockLedgerController = StockLedgerController;
//# sourceMappingURL=stock-ledger.controller.js.map