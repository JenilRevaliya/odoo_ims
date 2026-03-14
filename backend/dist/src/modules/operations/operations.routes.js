"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const operations_controller_1 = require("./operations.controller");
const auth_middleware_1 = require("../../shared/middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.requireAuth);
// CRUD
router.get('/', operations_controller_1.OperationsController.list);
router.get('/:id', operations_controller_1.OperationsController.getById);
router.post('/', operations_controller_1.OperationsController.create);
router.put('/:id', operations_controller_1.OperationsController.update);
// State transitions
router.post('/:id/submit', operations_controller_1.OperationsController.submit);
router.post('/:id/ready', operations_controller_1.OperationsController.markReady);
router.post('/:id/validate', operations_controller_1.OperationsController.validate);
router.post('/:id/cancel', operations_controller_1.OperationsController.cancel); // RBAC enforced inside service
exports.default = router;
//# sourceMappingURL=operations.routes.js.map