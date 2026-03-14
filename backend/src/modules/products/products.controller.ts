import { Request, Response } from 'express';
import { ProductsService } from './products.service';
import { z } from 'zod';
import { paramStr } from '../../shared/utils';

const createProductSchema = z.object({
  name: z.string().min(1),
  sku: z.string().min(3),
  category: z.string().min(1),
  unit_of_measure: z.string().min(1),
  minimum_stock: z.number().int().min(0).optional(),
  reorder_quantity: z.number().int().min(0).optional(),
});

const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  unit_of_measure: z.string().min(1).optional(),
  minimum_stock: z.number().int().min(0).optional(),
  reorder_quantity: z.number().int().min(0).optional(),
});

export class ProductsController {
  static async list(req: Request, res: Response) {
    try {
      const filters = {
        category: req.query.category as string | undefined,
        status: req.query.filter as 'low_stock' | 'out_of_stock' | undefined,
        search: req.query.search as string | undefined,
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        per_page: req.query.per_page ? parseInt(req.query.per_page as string, 10) : 20,
      };
      const result = await ProductsService.list(filters);
      res.json({ success: true, ...result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const product = await ProductsService.getById(paramStr(req.params.id));
      if (!product) return res.status(404).json({ success: false, error: { message: 'Product not found' } });
      res.json({ success: true, data: product });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  }

  static async searchBySku(req: Request, res: Response) {
    try {
      const sku = req.query.sku as string;
      if (!sku) return res.status(400).json({ success: false, error: { message: 'SKU query parameter required' } });
      const products = await ProductsService.searchBySku(sku);
      res.json({ success: true, data: products });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const data = createProductSchema.parse(req.body);
      const product = await ProductsService.create(data);
      res.status(201).json({ success: true, data: product });
    } catch (err: any) {
      const status = err.name === 'ZodError' ? 400 : 409;
      res.status(status).json({ success: false, error: { message: err.message } });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const data = updateProductSchema.parse(req.body);
      const product = await ProductsService.update(paramStr(req.params.id), data);
      res.json({ success: true, data: product });
    } catch (err: any) {
      const status = err.message === 'Product not found' ? 404 : 400;
      res.status(status).json({ success: false, error: { message: err.message } });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      await ProductsService.softDelete(paramStr(req.params.id));
      res.json({ success: true, data: { deleted: true } });
    } catch (err: any) {
      res.status(404).json({ success: false, error: { message: err.message } });
    }
  }
}
