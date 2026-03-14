CREATE TABLE IF NOT EXISTS products (
  id                UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  name              VARCHAR(200) NOT NULL,
  sku               VARCHAR(100) UNIQUE NOT NULL,
  category          VARCHAR(100) NOT NULL,
  unit_of_measure   VARCHAR(50)  NOT NULL,
  minimum_stock     INTEGER      NOT NULL DEFAULT 0,
  reorder_quantity  INTEGER      NOT NULL DEFAULT 0,
  is_deleted        BOOLEAN      DEFAULT false,
  created_at        TIMESTAMP    DEFAULT NOW(),
  updated_at        TIMESTAMP    DEFAULT NOW()
);
