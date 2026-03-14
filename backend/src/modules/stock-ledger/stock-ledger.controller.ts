import { Request, Response } from 'express';
import { StockLedgerService } from './stock-ledger.service';

export class StockLedgerController {
  static async list(req: Request, res: Response) {
    try {
      const filters = {
        product_id: req.query.product_id as string | undefined,
        location_id: req.query.location_id as string | undefined,
        operation_type: req.query.type as string | undefined,
        from: req.query.from as string | undefined,
        to: req.query.to as string | undefined,
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        per_page: req.query.per_page ? parseInt(req.query.per_page as string, 10) : 30,
      };
      const result = await StockLedgerService.list(filters);
      res.json({ success: true, ...result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  }
}
