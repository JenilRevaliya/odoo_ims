"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OperationsController = void 0;
const operations_service_1 = require("./operations.service");
const zod_1 = require("zod");
const utils_1 = require("../../shared/utils");
const createOperationSchema = zod_1.z.object({
    type: zod_1.z.enum(['receipt', 'delivery', 'transfer', 'adjustment']),
    source_location_id: zod_1.z.string().uuid().optional(),
    dest_location_id: zod_1.z.string().uuid().optional(),
    supplier_ref: zod_1.z.string().max(200).optional(),
    notes: zod_1.z.string().optional(),
    lines: zod_1.z.array(zod_1.z.object({
        product_id: zod_1.z.string().uuid(),
        expected_qty: zod_1.z.number().int().positive(),
    })).min(1).max(50),
});
const updateOperationSchema = zod_1.z.object({
    source_location_id: zod_1.z.string().uuid().optional(),
    dest_location_id: zod_1.z.string().uuid().optional(),
    supplier_ref: zod_1.z.string().max(200).optional(),
    notes: zod_1.z.string().optional(),
});
class OperationsController {
    static async list(req, res) {
        try {
            const filters = {
                type: req.query.type,
                status: req.query.status,
                warehouse_id: req.query.warehouse_id,
                from: req.query.from,
                to: req.query.to,
                ref: req.query.ref,
                page: req.query.page ? parseInt(req.query.page, 10) : 1,
                per_page: req.query.per_page ? parseInt(req.query.per_page, 10) : 20,
            };
            const result = await operations_service_1.OperationsService.list(filters);
            res.json({ success: true, ...result });
        }
        catch (err) {
            res.status(500).json({ success: false, error: { message: err.message } });
        }
    }
    static async getById(req, res) {
        try {
            const operation = await operations_service_1.OperationsService.getById((0, utils_1.paramStr)(req.params.id));
            if (!operation)
                return res.status(404).json({ success: false, error: { message: 'Operation not found' } });
            res.json({ success: true, data: operation });
        }
        catch (err) {
            res.status(500).json({ success: false, error: { message: err.message } });
        }
    }
    static async create(req, res) {
        try {
            const data = createOperationSchema.parse(req.body);
            const operation = await operations_service_1.OperationsService.create(req.user.userId, data);
            res.status(201).json({ success: true, data: operation });
        }
        catch (err) {
            const status = err.name === 'ZodError' ? 400 : 409;
            res.status(status).json({ success: false, error: { message: err.message } });
        }
    }
    static async update(req, res) {
        try {
            const data = updateOperationSchema.parse(req.body);
            const operation = await operations_service_1.OperationsService.update((0, utils_1.paramStr)(req.params.id), data);
            res.json({ success: true, data: operation });
        }
        catch (err) {
            const status = err.message.includes('OPERATION_LOCKED') ? 409 : err.message === 'Operation not found' ? 404 : 400;
            res.status(status).json({ success: false, error: { code: err.message.split(':')[0], message: err.message } });
        }
    }
    static async submit(req, res) {
        try {
            const operation = await operations_service_1.OperationsService.submit((0, utils_1.paramStr)(req.params.id));
            res.json({ success: true, data: operation });
        }
        catch (err) {
            const status = err.message.includes('OPERATION_LOCKED') ? 409 : 404;
            res.status(status).json({ success: false, error: { code: 'OPERATION_LOCKED', message: err.message } });
        }
    }
    static async markReady(req, res) {
        try {
            const operation = await operations_service_1.OperationsService.markReady((0, utils_1.paramStr)(req.params.id));
            res.json({ success: true, data: operation });
        }
        catch (err) {
            const status = err.message.includes('OPERATION_LOCKED') ? 409 : 404;
            res.status(status).json({ success: false, error: { code: 'OPERATION_LOCKED', message: err.message } });
        }
    }
    static async cancel(req, res) {
        try {
            const operation = await operations_service_1.OperationsService.cancel((0, utils_1.paramStr)(req.params.id), req.user.role);
            res.json({ success: true, data: operation });
        }
        catch (err) {
            const status = err.message.includes('FORBIDDEN') ? 403 : err.message.includes('OPERATION_LOCKED') ? 409 : 404;
            res.status(status).json({ success: false, error: { code: err.message.split(':')[0], message: err.message } });
        }
    }
    static async validate(req, res) {
        try {
            const operation = await operations_service_1.OperationsService.validate((0, utils_1.paramStr)(req.params.id), req.user.userId);
            res.json({ success: true, data: operation });
        }
        catch (err) {
            let status = 500;
            if (err.message.includes('OPERATION_LOCKED'))
                status = 409;
            else if (err.message.includes('INSUFFICIENT_STOCK'))
                status = 409;
            else if (err.message.includes('CONCURRENCY_CONFLICT'))
                status = 409;
            else if (err.message.includes('not found'))
                status = 404;
            res.status(status).json({ success: false, error: { code: err.message.split(':')[0], message: err.message } });
        }
    }
}
exports.OperationsController = OperationsController;
//# sourceMappingURL=operations.controller.js.map