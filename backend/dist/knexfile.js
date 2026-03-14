"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const config = {
    development: {
        client: 'pg',
        connection: process.env.DATABASE_URL,
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
        connection: process.env.DATABASE_URL || 'postgres://user:pass@localhost:5432/ims_test',
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
exports.default = config;
//# sourceMappingURL=knexfile.js.map