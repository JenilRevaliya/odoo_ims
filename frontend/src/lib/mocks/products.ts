import { Product } from '../../types';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prd-001',
    name: 'Steel Rod',
    sku: 'STL-001',
    category: 'Raw Materials',
    unit_of_measure: 'kg',
    minimum_stock: 50,
    reorder_quantity: 200,
    total_stock: 1250,
    stock_by_location: [
      { location_id: 'loc-a1', location: 'Warehouse A / Rack 1', quantity: 1000 },
      { location_id: 'loc-b1', location: 'Warehouse B / Rack 1', quantity: 250 },
    ],
  },
  {
    id: 'prd-002',
    name: 'Copper Wire',
    sku: 'COP-002',
    category: 'Raw Materials',
    unit_of_measure: 'm',
    minimum_stock: 100,
    reorder_quantity: 500,
    total_stock: 45,
    stock_by_location: [
      { location_id: 'loc-a1', location: 'Warehouse A / Rack 1', quantity: 45 },
    ],
  },
  {
    id: 'prd-003',
    name: 'Titanium Screws',
    sku: 'TIT-003',
    category: 'Hardware',
    unit_of_measure: 'pcs',
    minimum_stock: 1000,
    reorder_quantity: 5000,
    total_stock: 800,
    stock_by_location: [
      { location_id: 'loc-a2', location: 'Warehouse A / Rack 2', quantity: 800 },
    ],
  },
  {
    id: 'prd-004',
    name: 'Aluminum Sheets',
    sku: 'ALU-004',
    category: 'Raw Materials',
    unit_of_measure: 'sqm',
    minimum_stock: 20,
    reorder_quantity: 100,
    total_stock: 0,
    stock_by_location: [],
  },
  {
    id: 'prd-005',
    name: 'Industrial Glue',
    sku: 'GLU-005',
    category: 'Consumables',
    unit_of_measure: 'L',
    minimum_stock: 10,
    reorder_quantity: 50,
    total_stock: 8,
    stock_by_location: [
      { location_id: 'loc-b2', location: 'Warehouse B / Rack 2', quantity: 8 },
    ],
  },
];
