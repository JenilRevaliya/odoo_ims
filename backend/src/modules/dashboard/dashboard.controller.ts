import { Request, Response } from 'express';
import { DashboardService } from './dashboard.service';

export class DashboardController {
  static async getKPIs(req: Request, res: Response) {
    try {
      const warehouseId = req.query.warehouse_id as string | undefined;
      const kpis = await DashboardService.getKPIs(warehouseId);
      res.json({ success: true, data: kpis });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  }

  static async getLowStock(req: Request, res: Response) {
    try {
      const warehouseId = req.query.warehouse_id as string | undefined;
      const products = await DashboardService.getLowStockProducts(warehouseId);
      res.json({ success: true, data: products });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  }

  static async getRecentOperations(req: Request, res: Response) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      const operations = await DashboardService.getRecentOperations(limit);
      res.json({ success: true, data: operations });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  }
}
