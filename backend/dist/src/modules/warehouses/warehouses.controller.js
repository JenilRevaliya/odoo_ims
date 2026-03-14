"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WarehousesController = void 0;
const warehouses_service_1 = require("./warehouses.service");
const zod_1 = require("zod");
const utils_1 = require("../../shared/utils");
const createWarehouseSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    address: zod_1.z.string().optional(),
});
const createLocationSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
});
class WarehousesController {
    static async listWarehouses(req, res) {
        try {
            const warehouses = await warehouses_service_1.WarehousesService.listWarehouses();
            res.json({ success: true, data: warehouses });
        }
        catch (err) {
            res.status(500).json({ success: false, error: { message: err.message } });
        }
    }
    static async getWarehouse(req, res) {
        try {
            const warehouse = await warehouses_service_1.WarehousesService.getWarehouseById((0, utils_1.paramStr)(req.params.id));
            if (!warehouse)
                return res.status(404).json({ success: false, error: { message: 'Warehouse not found' } });
            res.json({ success: true, data: warehouse });
        }
        catch (err) {
            res.status(500).json({ success: false, error: { message: err.message } });
        }
    }
    static async createWarehouse(req, res) {
        try {
            const data = createWarehouseSchema.parse(req.body);
            const warehouse = await warehouses_service_1.WarehousesService.createWarehouse(data);
            res.status(201).json({ success: true, data: warehouse });
        }
        catch (err) {
            res.status(400).json({ success: false, error: { message: err.message } });
        }
    }
    static async listLocations(req, res) {
        try {
            const locations = await warehouses_service_1.WarehousesService.listLocations((0, utils_1.paramStr)(req.params.id));
            res.json({ success: true, data: locations });
        }
        catch (err) {
            res.status(500).json({ success: false, error: { message: err.message } });
        }
    }
    static async createLocation(req, res) {
        try {
            const data = createLocationSchema.parse(req.body);
            const location = await warehouses_service_1.WarehousesService.createLocation((0, utils_1.paramStr)(req.params.id), data);
            res.status(201).json({ success: true, data: location });
        }
        catch (err) {
            const status = err.message === 'Warehouse not found' ? 404 : 400;
            res.status(status).json({ success: false, error: { message: err.message } });
        }
    }
    static async deleteLocation(req, res) {
        try {
            await warehouses_service_1.WarehousesService.deleteLocation((0, utils_1.paramStr)(req.params.id), (0, utils_1.paramStr)(req.params.locId));
            res.json({ success: true, data: { deleted: true } });
        }
        catch (err) {
            const status = err.message.includes('not found') ? 404 : 409;
            res.status(status).json({ success: false, error: { message: err.message } });
        }
    }
}
exports.WarehousesController = WarehousesController;
//# sourceMappingURL=warehouses.controller.js.map