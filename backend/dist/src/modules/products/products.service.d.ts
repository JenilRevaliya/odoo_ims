interface CreateProductInput {
    name: string;
    sku: string;
    category: string;
    unit_of_measure: string;
    minimum_stock?: number;
    reorder_quantity?: number;
}
interface UpdateProductInput {
    name?: string;
    category?: string;
    unit_of_measure?: string;
    minimum_stock?: number;
    reorder_quantity?: number;
}
interface ProductFilters {
    category?: string;
    status?: 'low_stock' | 'out_of_stock';
    search?: string;
    page?: number;
    per_page?: number;
}
export declare class ProductsService {
    static list(filters: ProductFilters): Promise<{
        data: any[];
        meta: {
            page: number;
            per_page: number;
            total: number;
            total_pages: number;
        };
    }>;
    static getById(id: string): Promise<any>;
    static searchBySku(sku: string): Promise<any[]>;
    static create(data: CreateProductInput): Promise<any>;
    static update(id: string, data: UpdateProductInput): Promise<any>;
    static softDelete(id: string): Promise<{
        deleted: boolean;
    }>;
}
export {};
//# sourceMappingURL=products.service.d.ts.map