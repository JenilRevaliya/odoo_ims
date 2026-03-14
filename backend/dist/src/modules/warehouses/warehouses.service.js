"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WarehousesService = void 0;
const db_1 = __importDefault(require("../../config/db"));
const uuid_1 = require("uuid");
class WarehousesService {
    static async listWarehouses() {
        return (0, db_1.default)('warehouses').select('*').orderBy('name', 'asc');
    }
    static async getWarehouseById(id) {
        const warehouse = await (0, db_1.default)('warehouses').where({ id }).first();
        if (!warehouse)
            return null;
        return warehouse;
    }
    static async createWarehouse(data) {
        const id = (0, uuid_1.v4)();
        const [warehouse] = await (0, db_1.default)('warehouses')
            .insert({ id, name: data.name, address: data.address || null })
            .returning('*');
        return warehouse;
    }
    static async listLocations(warehouseId) {
        return (0, db_1.default)('locations').where({ warehouse_id: warehouseId }).orderBy('name', 'asc');
    }
    static async createLocation(warehouseId, data) {
        const warehouse = await (0, db_1.default)('warehouses').where({ id: warehouseId }).first();
        if (!warehouse)
            throw new Error('Warehouse not found');
        const id = (0, uuid_1.v4)();
        const [location] = await (0, db_1.default)('locations')
            .insert({
            id,
            warehouse_id: warehouseId,
            name: data.name,
            description: data.description || null,
        })
            .returning('*');
        return location;
    }
    static async deleteLocation(warehouseId, locationId) {
        const location = await (0, db_1.default)('locations')
            .where({ id: locationId, warehouse_id: warehouseId })
            .first();
        if (!location)
            throw new Error('Location not found');
        // Check if stock exists at this location
        const stockAtLocation = await (0, db_1.default)('stock_balances')
            .where({ location_id: locationId })
            .andWhere('quantity', '>', 0)
            .first();
        if (stockAtLocation) {
            throw new Error('Cannot delete location: stock exists at this location. Move or adjust stock first.');
        }
        await (0, db_1.default)('locations').where({ id: locationId }).del();
        return { deleted: true };
    }
}
exports.WarehousesService = WarehousesService;
//# sourceMappingURL=warehouses.service.js.map