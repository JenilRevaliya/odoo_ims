CREATE TABLE IF NOT EXISTS stock_ledger (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      UUID        NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  location_id     UUID        NOT NULL REFERENCES locations(id) ON DELETE RESTRICT,
  operation_id    UUID        NOT NULL REFERENCES operations(id) ON DELETE RESTRICT,
  user_id         UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  delta           INTEGER     NOT NULL,
  balance_after   INTEGER     NOT NULL,
  operation_type  VARCHAR(50) NOT NULL,
  created_at      TIMESTAMP   DEFAULT NOW()
);
