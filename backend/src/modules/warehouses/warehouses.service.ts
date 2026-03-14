import db from '../../config/db';
import { v4 as uuidv4 } from 'uuid';

interface CreateWarehouseInput {
  name: string;
  address?: string;
}

interface CreateLocationInput {
  name: string;
  description?: string;
}

export class WarehousesService {
  static async listWarehouses() {
    return db('warehouses').select('*').orderBy('name', 'asc');
  }

  static async getWarehouseById(id: string) {
    const warehouse = await db('warehouses').where({ id }).first();
    if (!warehouse) return null;
    return warehouse;
  }

  static async createWarehouse(data: CreateWarehouseInput) {
    const id = uuidv4();
    const [warehouse] = await db('warehouses')
      .insert({ id, name: data.name, address: data.address || null })
      .returning('*');
    return warehouse;
  }

  static async listLocations(warehouseId: string) {
    return db('locations').where({ warehouse_id: warehouseId }).orderBy('name', 'asc');
  }

  static async createLocation(warehouseId: string, data: CreateLocationInput) {
    const warehouse = await db('warehouses').where({ id: warehouseId }).first();
    if (!warehouse) throw new Error('Warehouse not found');

    const id = uuidv4();
    const [location] = await db('locations')
      .insert({
        id,
        warehouse_id: warehouseId,
        name: data.name,
        description: data.description || null,
      })
      .returning('*');
    return location;
  }

  static async deleteLocation(warehouseId: string, locationId: string) {
    const location = await db('locations')
      .where({ id: locationId, warehouse_id: warehouseId })
      .first();
    if (!location) throw new Error('Location not found');

    // Check if stock exists at this location
    const stockAtLocation = await db('stock_balances')
      .where({ location_id: locationId })
      .andWhere('quantity', '>', 0)
      .first();

    if (stockAtLocation) {
      throw new Error('Cannot delete location: stock exists at this location. Move or adjust stock first.');
    }

    await db('locations').where({ id: locationId }).del();
    return { deleted: true };
  }
}
