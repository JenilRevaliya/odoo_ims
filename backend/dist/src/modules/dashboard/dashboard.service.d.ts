export declare class DashboardService {
    static getKPIs(warehouseId?: string): Promise<{
        total_products_in_stock: number;
        low_stock_count: number;
        out_of_stock_count: number;
        pending_receipts: number;
        pending_deliveries: number;
        scheduled_transfers: number;
        as_of: string;
    }>;
    static getLowStockProducts(warehouseId?: string): Promise<any[]>;
    static getRecentOperations(limit?: number): Promise<any[]>;
}
//# sourceMappingURL=dashboard.service.d.ts.map