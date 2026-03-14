import { Router } from 'express';
import { WarehousesController } from './warehouses.controller';
import { requireAuth, requireRole } from '../../shared/middleware/auth.middleware';

const router = Router();

router.use(requireAuth);

router.get('/', WarehousesController.listWarehouses);
router.post('/', requireRole(['manager']), WarehousesController.createWarehouse);
router.get('/:id', WarehousesController.getWarehouse);
router.get('/:id/locations', WarehousesController.listLocations);
router.post('/:id/locations', requireRole(['manager']), WarehousesController.createLocation);
router.delete('/:id/locations/:locId', requireRole(['manager']), WarehousesController.deleteLocation);

export default router;
