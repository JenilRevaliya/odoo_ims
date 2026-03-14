import { Request, Response } from 'express';
export declare class WarehousesController {
    static listWarehouses(req: Request, res: Response): Promise<void>;
    static getWarehouse(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static createWarehouse(req: Request, res: Response): Promise<void>;
    static listLocations(req: Request, res: Response): Promise<void>;
    static createLocation(req: Request, res: Response): Promise<void>;
    static deleteLocation(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=warehouses.controller.d.ts.map