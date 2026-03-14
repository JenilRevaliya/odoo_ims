type OpType = 'receipt' | 'delivery' | 'transfer' | 'adjustment';
type OpStatus = 'draft' | 'waiting' | 'ready' | 'done' | 'canceled';
interface CreateOperationInput {
    type: OpType;
    source_location_id?: string;
    dest_location_id?: string;
    supplier_ref?: string;
    notes?: string;
    lines: {
        product_id: string;
        expected_qty: number;
    }[];
}
interface OperationFilters {
    type?: OpType;
    status?: OpStatus;
    warehouse_id?: string;
    from?: string;
    to?: string;
    ref?: string;
    page?: number;
    per_page?: number;
}
export declare class OperationsService {
    static list(filters: OperationFilters): Promise<{
        data: any[];
        meta: {
            page: number;
            per_page: number;
            total: number;
            total_pages: number;
        };
    }>;
    static getById(id: string): Promise<any>;
    static create(userId: string, data: CreateOperationInput): Promise<any>;
    static update(id: string, data: Partial<CreateOperationInput>): Promise<any>;
    static submit(id: string): Promise<any>;
    static markReady(id: string): Promise<any>;
    static cancel(id: string, userRole: string): Promise<any>;
    private static _transition;
    static validate(id: string, userId: string): Promise<any>;
    private static _upsertStock;
    private static _decreaseStock;
    private static _adjustStock;
    private static _insertLedger;
}
export {};
//# sourceMappingURL=operations.service.d.ts.map