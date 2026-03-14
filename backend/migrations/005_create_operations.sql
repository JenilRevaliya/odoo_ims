CREATE TABLE IF NOT EXISTS operations (
  id                   UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  type                 VARCHAR(20)  NOT NULL CHECK (type IN ('receipt','delivery','transfer','adjustment')),
  status               VARCHAR(20)  NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','waiting','ready','done','canceled')),
  created_by           UUID         NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  source_location_id   UUID         NULL REFERENCES locations(id) ON DELETE RESTRICT,
  dest_location_id     UUID         NULL REFERENCES locations(id) ON DELETE RESTRICT,
  reference_number     VARCHAR(100) UNIQUE,
  supplier_ref         VARCHAR(200) NULL,
  notes                TEXT         NULL,
  created_at           TIMESTAMP    DEFAULT NOW(),
  updated_at           TIMESTAMP    DEFAULT NOW(),
  validated_at         TIMESTAMP    NULL,
  validated_by         UUID         NULL REFERENCES users(id) ON DELETE RESTRICT
);
