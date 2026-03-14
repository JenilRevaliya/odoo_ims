"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const dashboard_service_1 = require("./dashboard.service");
class DashboardController {
    static async getKPIs(req, res) {
        try {
            const warehouseId = req.query.warehouse_id;
            const kpis = await dashboard_service_1.DashboardService.getKPIs(warehouseId);
            res.json({ success: true, data: kpis });
        }
        catch (err) {
            res.status(500).json({ success: false, error: { message: err.message } });
        }
    }
    static async getLowStock(req, res) {
        try {
            const warehouseId = req.query.warehouse_id;
            const products = await dashboard_service_1.DashboardService.getLowStockProducts(warehouseId);
            res.json({ success: true, data: products });
        }
        catch (err) {
            res.status(500).json({ success: false, error: { message: err.message } });
        }
    }
    static async getRecentOperations(req, res) {
        try {
            const limit = req.query.limit ? parseInt(req.query.limit, 10) : 20;
            const operations = await dashboard_service_1.DashboardService.getRecentOperations(limit);
            res.json({ success: true, data: operations });
        }
        catch (err) {
            res.status(500).json({ success: false, error: { message: err.message } });
        }
    }
}
exports.DashboardController = DashboardController;
//# sourceMappingURL=dashboard.controller.js.map