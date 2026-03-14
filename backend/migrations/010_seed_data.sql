-- Using a known bcrypt hash for 'admin'
INSERT INTO users (id, name, email, password_hash, role) VALUES 
('00000000-0000-0000-0000-000000000001', 'Admin', 'admin@example.com', '$2b$10$Ew2.oV7AONo7XvXn/C1aFeV/gE.603UOMh0bED43wz45Tf/gE1i3G', 'manager')
ON CONFLICT DO NOTHING;

INSERT INTO warehouses (id, name, address) VALUES 
('11111111-1111-1111-1111-111111111111', 'Main Warehouse', '123 Main St'),
('11111111-1111-1111-1111-111111111112', 'Secondary Warehouse', '456 Side St')
ON CONFLICT DO NOTHING;

INSERT INTO locations (id, warehouse_id, name) VALUES 
('22222222-2222-2222-2222-222222222221', '11111111-1111-1111-1111-111111111111', 'Rack A'),
('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111112', 'Rack B'),
('22222222-2222-2222-2222-222222222223', '11111111-1111-1111-1111-111111111111', 'Zone X')
ON CONFLICT DO NOTHING;

INSERT INTO products (id, name, sku, category, unit_of_measure, minimum_stock, reorder_quantity) VALUES 
('33333333-3333-3333-3333-333333333331', 'Steel Rod', 'STL-001', 'Raw Material', 'kg', 10, 50),
('33333333-3333-3333-3333-333333333332', 'Copper Wire', 'COP-001', 'Raw Material', 'kg', 20, 100),
('33333333-3333-3333-3333-333333333333', 'Wood Panel', 'WP-001', 'Raw Material', 'pcs', 5, 20)
ON CONFLICT DO NOTHING;
