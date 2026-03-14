"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const stock_ledger_controller_1 = require("./stock-ledger.controller");
const auth_middleware_1 = require("../../shared/middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.requireAuth);
router.get('/', stock_ledger_controller_1.StockLedgerController.list);
exports.default = router;
//# sourceMappingURL=stock-ledger.routes.js.map