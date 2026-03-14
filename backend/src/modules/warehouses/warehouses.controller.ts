import { Request, Response } from 'express';
import { WarehousesService } from './warehouses.service';
import { z } from 'zod';

const createWarehouseSchema = z.object({
  name: z.string().min(1),
  address: z.string().optional(),
});

const createLocationSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

export class WarehousesController {
  static async listWarehouses(req: Request, res: Response) {
    try {
      const warehouses = await WarehousesService.listWarehouses();
      res.json({ success: true, data: warehouses });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  }

  static async getWarehouse(req: Request, res: Response) {
    try {
      const warehouse = await WarehousesService.getWarehouseById(req.params.id);
      if (!warehouse) return res.status(404).json({ success: false, error: { message: 'Warehouse not found' } });
      res.json({ success: true, data: warehouse });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  }

  static async createWarehouse(req: Request, res: Response) {
    try {
      const data = createWarehouseSchema.parse(req.body);
      const warehouse = await WarehousesService.createWarehouse(data);
      res.status(201).json({ success: true, data: warehouse });
    } catch (err: any) {
      res.status(400).json({ success: false, error: { message: err.message } });
    }
  }

  static async listLocations(req: Request, res: Response) {
    try {
      const locations = await WarehousesService.listLocations(req.params.id);
      res.json({ success: true, data: locations });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  }

  static async createLocation(req: Request, res: Response) {
    try {
      const data = createLocationSchema.parse(req.body);
      const location = await WarehousesService.createLocation(req.params.id, data);
      res.status(201).json({ success: true, data: location });
    } catch (err: any) {
      const status = err.message === 'Warehouse not found' ? 404 : 400;
      res.status(status).json({ success: false, error: { message: err.message } });
    }
  }

  static async deleteLocation(req: Request, res: Response) {
    try {
      await WarehousesService.deleteLocation(req.params.id, req.params.locId);
      res.json({ success: true, data: { deleted: true } });
    } catch (err: any) {
      const status = err.message.includes('not found') ? 404 : 409;
      res.status(status).json({ success: false, error: { message: err.message } });
    }
  }
}
