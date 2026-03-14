CREATE OR REPLACE FUNCTION prevent_stock_ledger_updates()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Updates and Deletes are not allowed on the stock_ledger table.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER stock_ledger_prevent_updates_deletes
BEFORE UPDATE OR DELETE ON stock_ledger
FOR EACH ROW EXECUTE FUNCTION prevent_stock_ledger_updates();
