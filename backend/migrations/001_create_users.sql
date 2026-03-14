CREATE TABLE IF NOT EXISTS users (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  name         VARCHAR(100) NOT NULL,
  email        VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT        NOT NULL,
  role         VARCHAR(20)  NOT NULL DEFAULT 'staff' CHECK (role IN ('manager','staff')),
  created_at   TIMESTAMP    DEFAULT NOW(),
  updated_at   TIMESTAMP    DEFAULT NOW()
);
