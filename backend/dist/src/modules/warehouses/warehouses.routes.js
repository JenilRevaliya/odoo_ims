"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const warehouses_controller_1 = require("./warehouses.controller");
const auth_middleware_1 = require("../../shared/middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.requireAuth);
router.get('/', warehouses_controller_1.WarehousesController.listWarehouses);
router.post('/', (0, auth_middleware_1.requireRole)(['manager']), warehouses_controller_1.WarehousesController.createWarehouse);
router.get('/:id', warehouses_controller_1.WarehousesController.getWarehouse);
router.get('/:id/locations', warehouses_controller_1.WarehousesController.listLocations);
router.post('/:id/locations', (0, auth_middleware_1.requireRole)(['manager']), warehouses_controller_1.WarehousesController.createLocation);
router.delete('/:id/locations/:locId', (0, auth_middleware_1.requireRole)(['manager']), warehouses_controller_1.WarehousesController.deleteLocation);
exports.default = router;
//# sourceMappingURL=warehouses.routes.js.map