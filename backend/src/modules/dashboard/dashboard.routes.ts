import { Router } from 'express';
import { DashboardController } from './dashboard.controller';
import { requireAuth } from '../../shared/middleware/auth.middleware';

const router = Router();

router.use(requireAuth);

router.get('/kpis', DashboardController.getKPIs);
router.get('/low-stock', DashboardController.getLowStock);
router.get('/recent-operations', DashboardController.getRecentOperations);

export default router;
