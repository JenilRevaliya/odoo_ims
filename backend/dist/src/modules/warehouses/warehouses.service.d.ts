interface CreateWarehouseInput {
    name: string;
    address?: string;
}
interface CreateLocationInput {
    name: string;
    description?: string;
}
export declare class WarehousesService {
    static listWarehouses(): Promise<any[]>;
    static getWarehouseById(id: string): Promise<any>;
    static createWarehouse(data: CreateWarehouseInput): Promise<any>;
    static listLocations(warehouseId: string): Promise<any[]>;
    static createLocation(warehouseId: string, data: CreateLocationInput): Promise<any>;
    static deleteLocation(warehouseId: string, locationId: string): Promise<{
        deleted: boolean;
    }>;
}
export {};
//# sourceMappingURL=warehouses.service.d.ts.map