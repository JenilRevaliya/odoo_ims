import { Request, Response } from 'express';
import { AuthRequest } from '../../shared/middleware/auth.middleware';
export declare class OperationsController {
    static list(req: Request, res: Response): Promise<void>;
    static getById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static create(req: AuthRequest, res: Response): Promise<void>;
    static update(req: Request, res: Response): Promise<void>;
    static submit(req: Request, res: Response): Promise<void>;
    static markReady(req: Request, res: Response): Promise<void>;
    static cancel(req: AuthRequest, res: Response): Promise<void>;
    static validate(req: AuthRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=operations.controller.d.ts.map