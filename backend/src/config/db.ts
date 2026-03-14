import knex from 'knex';
import knexConfig from '../../knexfile';

const environment = process.env.NODE_ENV || 'development';

const configToUse = (knexConfig as any).default || knexConfig;
const db = knex(configToUse[environment]);

export default db;
