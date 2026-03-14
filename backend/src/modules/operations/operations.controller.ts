import { Request, Response } from 'express';
import { OperationsService } from './operations.service';
import { AuthRequest } from '../../shared/middleware/auth.middleware';
import { z } from 'zod';

const createOperationSchema = z.object({
  type: z.enum(['receipt', 'delivery', 'transfer', 'adjustment']),
  source_location_id: z.string().uuid().optional(),
  dest_location_id: z.string().uuid().optional(),
  supplier_ref: z.string().max(200).optional(),
  notes: z.string().optional(),
  lines: z.array(z.object({
    product_id: z.string().uuid(),
    expected_qty: z.number().int().positive(),
  })).min(1).max(50),
});

const updateOperationSchema = z.object({
  source_location_id: z.string().uuid().optional(),
  dest_location_id: z.string().uuid().optional(),
  supplier_ref: z.string().max(200).optional(),
  notes: z.string().optional(),
});

export class OperationsController {
  static async list(req: Request, res: Response) {
    try {
      const filters = {
        type: req.query.type as any,
        status: req.query.status as any,
        warehouse_id: req.query.warehouse_id as string | undefined,
        from: req.query.from as string | undefined,
        to: req.query.to as string | undefined,
        ref: req.query.ref as string | undefined,
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        per_page: req.query.per_page ? parseInt(req.query.per_page as string, 10) : 20,
      };
      const result = await OperationsService.list(filters);
      res.json({ success: true, ...result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const operation = await OperationsService.getById(req.params.id);
      if (!operation) return res.status(404).json({ success: false, error: { message: 'Operation not found' } });
      res.json({ success: true, data: operation });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  }

  static async create(req: AuthRequest, res: Response) {
    try {
      const data = createOperationSchema.parse(req.body);
      const operation = await OperationsService.create(req.user!.userId, data);
      res.status(201).json({ success: true, data: operation });
    } catch (err: any) {
      const status = err.name === 'ZodError' ? 400 : 409;
      res.status(status).json({ success: false, error: { message: err.message } });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const data = updateOperationSchema.parse(req.body);
      const operation = await OperationsService.update(req.params.id, data);
      res.json({ success: true, data: operation });
    } catch (err: any) {
      const status = err.message.includes('OPERATION_LOCKED') ? 409 : err.message === 'Operation not found' ? 404 : 400;
      res.status(status).json({ success: false, error: { code: err.message.split(':')[0], message: err.message } });
    }
  }

  static async submit(req: Request, res: Response) {
    try {
      const operation = await OperationsService.submit(req.params.id);
      res.json({ success: true, data: operation });
    } catch (err: any) {
      const status = err.message.includes('OPERATION_LOCKED') ? 409 : 404;
      res.status(status).json({ success: false, error: { code: 'OPERATION_LOCKED', message: err.message } });
    }
  }

  static async markReady(req: Request, res: Response) {
    try {
      const operation = await OperationsService.markReady(req.params.id);
      res.json({ success: true, data: operation });
    } catch (err: any) {
      const status = err.message.includes('OPERATION_LOCKED') ? 409 : 404;
      res.status(status).json({ success: false, error: { code: 'OPERATION_LOCKED', message: err.message } });
    }
  }

  static async cancel(req: AuthRequest, res: Response) {
    try {
      const operation = await OperationsService.cancel(req.params.id, req.user!.role);
      res.json({ success: true, data: operation });
    } catch (err: any) {
      const status = err.message.includes('FORBIDDEN') ? 403 : err.message.includes('OPERATION_LOCKED') ? 409 : 404;
      res.status(status).json({ success: false, error: { code: err.message.split(':')[0], message: err.message } });
    }
  }

  static async validate(req: AuthRequest, res: Response) {
    try {
      const operation = await OperationsService.validate(req.params.id, req.user!.userId);
      res.json({ success: true, data: operation });
    } catch (err: any) {
      let status = 500;
      if (err.message.includes('OPERATION_LOCKED')) status = 409;
      else if (err.message.includes('INSUFFICIENT_STOCK')) status = 409;
      else if (err.message.includes('CONCURRENCY_CONFLICT')) status = 409;
      else if (err.message.includes('not found')) status = 404;
      res.status(status).json({ success: false, error: { code: err.message.split(':')[0], message: err.message } });
    }
  }
}
