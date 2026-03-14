CREATE TABLE IF NOT EXISTS warehouses (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(200) NOT NULL,
  address     TEXT         NULL,
  created_at  TIMESTAMP    DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS locations (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  warehouse_id  UUID         NOT NULL REFERENCES warehouses(id) ON DELETE RESTRICT,
  name          VARCHAR(100) NOT NULL,
  description   TEXT         NULL,
  created_at    TIMESTAMP    DEFAULT NOW()
);
