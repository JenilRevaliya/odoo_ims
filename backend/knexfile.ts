import 'dotenv/config';
import type { Knex } from 'knex';

const config: { [key: string]: Knex.Config } = {
  development: {
    client: 'pg',
    connection: process.env.DATABASE_URL || 'postgres://postgres:corepassword@localhost:15432/coreinventory',
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './migrations/development'
    },
  },
  test: {
    client: 'pg',
    connection: process.env.DATABASE_URL || 'postgres://postgres:corepassword@localhost:15432/coreinventory',
    pool: {
      min: 1,
      max: 2,
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './migrations/development'
    },
  },
  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    pool: {
      min: 2,
      max: 20,
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './migrations/production'
    },
  },
};

export default config;
