CREATE TABLE IF NOT EXISTS operation_lines (
  id            UUID     PRIMARY KEY DEFAULT gen_random_uuid(),
  operation_id  UUID     NOT NULL REFERENCES operations(id) ON DELETE CASCADE,
  product_id    UUID     NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  expected_qty  INTEGER  NOT NULL CHECK (expected_qty > 0),
  done_qty      INTEGER  NULL
);
