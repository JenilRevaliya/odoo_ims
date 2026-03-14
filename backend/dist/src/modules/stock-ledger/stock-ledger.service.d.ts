interface LedgerFilters {
    product_id?: string;
    location_id?: string;
    operation_type?: string;
    from?: string;
    to?: string;
    page?: number;
    per_page?: number;
}
export declare class StockLedgerService {
    static list(filters: LedgerFilters): Promise<{
        data: any[];
        meta: {
            page: number;
            per_page: number;
            total: number;
            total_pages: number;
        };
    }>;
}
export {};
//# sourceMappingURL=stock-ledger.service.d.ts.map