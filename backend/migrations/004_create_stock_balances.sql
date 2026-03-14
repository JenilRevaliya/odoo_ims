CREATE TABLE IF NOT EXISTS stock_balances (
  id          UUID       PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID       NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  location_id UUID       NOT NULL REFERENCES locations(id) ON DELETE RESTRICT,
  quantity    INTEGER    NOT NULL DEFAULT 0,
  version     INTEGER    NOT NULL DEFAULT 0,
  updated_at  TIMESTAMP  DEFAULT NOW(),
  UNIQUE (product_id, location_id),
  CHECK (quantity >= 0)
);
