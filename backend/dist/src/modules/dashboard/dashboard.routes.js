"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboard_controller_1 = require("./dashboard.controller");
const auth_middleware_1 = require("../../shared/middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.requireAuth);
router.get('/kpis', dashboard_controller_1.DashboardController.getKPIs);
router.get('/low-stock', dashboard_controller_1.DashboardController.getLowStock);
router.get('/recent-operations', dashboard_controller_1.DashboardController.getRecentOperations);
exports.default = router;
//# sourceMappingURL=dashboard.routes.js.map