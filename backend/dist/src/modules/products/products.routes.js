"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const products_controller_1 = require("./products.controller");
const auth_middleware_1 = require("../../shared/middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.requireAuth);
router.get('/', products_controller_1.ProductsController.list);
router.get('/search', products_controller_1.ProductsController.searchBySku);
router.get('/:id', products_controller_1.ProductsController.getById);
router.post('/', (0, auth_middleware_1.requireRole)(['manager']), products_controller_1.ProductsController.create);
router.put('/:id', (0, auth_middleware_1.requireRole)(['manager']), products_controller_1.ProductsController.update);
router.delete('/:id', (0, auth_middleware_1.requireRole)(['manager']), products_controller_1.ProductsController.delete);
exports.default = router;
//# sourceMappingURL=products.routes.js.map