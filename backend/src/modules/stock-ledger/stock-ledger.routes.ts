import { Router } from 'express';
import { StockLedgerController } from './stock-ledger.controller';
import { requireAuth } from '../../shared/middleware/auth.middleware';

const router = Router();

router.use(requireAuth);

router.get('/', StockLedgerController.list);

export default router;
