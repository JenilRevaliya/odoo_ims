import db from '../src/config/db';

describe('stock_ledger immutability', () => {
  beforeAll(async () => {
    // Run migrations before tests? For now we assume db is up and migrated.
  });

  afterAll(async () => {
    await db.destroy();
  });

  it('should prevent UPDATE on stock_ledger', async () => {
    let error;
    try {
      // Just a dummy query to see if trigger fires
      await db.raw(`UPDATE stock_ledger SET delta = 100 WHERE 1=1;`);
    } catch (err: any) {
      error = err;
    }
    expect(error).toBeDefined();
    expect(error.message).toContain('Updates and Deletes are not allowed');
  });

  it('should prevent DELETE on stock_ledger', async () => {
    let error;
    try {
      await db.raw(`DELETE FROM stock_ledger WHERE 1=1;`);
    } catch (err: any) {
      error = err;
    }
    expect(error).toBeDefined();
    expect(error.message).toContain('Updates and Deletes are not allowed');
  });
});
