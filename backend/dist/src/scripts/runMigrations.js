"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const db_1 = __importDefault(require("../config/db"));
async function run() {
    const migrationsDir = path_1.default.join(__dirname, '../../migrations');
    const files = fs_1.default.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();
    for (const file of files) {
        console.log(`Running migration: ${file}`);
        const sql = fs_1.default.readFileSync(path_1.default.join(migrationsDir, file), 'utf8');
        await db_1.default.raw(sql);
    }
    console.log('All migrations applied successfully.');
    process.exit(0);
}
run().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
});
//# sourceMappingURL=runMigrations.js.map