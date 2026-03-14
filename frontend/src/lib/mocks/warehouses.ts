import { Warehouse, Location } from '../../types';

export const MOCK_WAREHOUSES: Warehouse[] = [
  {
    id: 'wh-001',
    name: 'Main Alpha',
    address: '123 Industrial Way, Sector 4',
    created_at: new Date(Date.now() - 31536000000).toISOString(),
  },
  {
    id: 'wh-002',
    name: 'Secondary Beta',
    address: '456 Logistics Park, Zone B',
    created_at: new Date(Date.now() - 15768000000).toISOString(),
  },
];

export const MOCK_LOCATIONS: Location[] = [
  {
    id: 'loc-a1',
    warehouse_id: 'wh-001',
    name: 'Warehouse A / Rack 1',
    description: 'Heavy materials receiving area',
  },
  {
    id: 'loc-a2',
    warehouse_id: 'wh-001',
    name: 'Warehouse A / Rack 2',
    description: 'Hardware storage',
  },
  {
    id: 'loc-a3',
    warehouse_id: 'wh-001',
    name: 'Warehouse A / Rack 3',
    description: 'Overflow',
  },
  {
    id: 'loc-b1',
    warehouse_id: 'wh-002',
    name: 'Warehouse B / Rack 1',
    description: 'Outbound staging',
  },
  {
    id: 'loc-b2',
    warehouse_id: 'wh-002',
    name: 'Warehouse B / Rack 2',
    description: 'Chemicals and consumables',
  },
];
