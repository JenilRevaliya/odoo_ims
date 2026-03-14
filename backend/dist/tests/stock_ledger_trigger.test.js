"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../src/config/db"));
describe('stock_ledger immutability', () => {
    beforeAll(async () => {
        // Run migrations before tests? For now we assume db is up and migrated.
    });
    afterAll(async () => {
        await db_1.default.destroy();
    });
    it('should prevent UPDATE on stock_ledger', async () => {
        let error;
        try {
            // Just a dummy query to see if trigger fires
            await db_1.default.raw(`UPDATE stock_ledger SET delta = 100 WHERE 1=1;`);
        }
        catch (err) {
            error = err;
        }
        expect(error).toBeDefined();
        expect(error.message).toContain('Updates and Deletes are not allowed');
    });
    it('should prevent DELETE on stock_ledger', async () => {
        let error;
        try {
            await db_1.default.raw(`DELETE FROM stock_ledger WHERE 1=1;`);
        }
        catch (err) {
            error = err;
        }
        expect(error).toBeDefined();
        expect(error.message).toContain('Updates and Deletes are not allowed');
    });
});
//# sourceMappingURL=stock_ledger_trigger.test.js.map