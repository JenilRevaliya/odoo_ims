import { Router } from 'express';
import { ProductsController } from './products.controller';
import { requireAuth, requireRole } from '../../shared/middleware/auth.middleware';

const router = Router();

router.use(requireAuth);

router.get('/', ProductsController.list);
router.get('/search', ProductsController.searchBySku);
router.get('/:id', ProductsController.getById);
router.post('/', requireRole(['manager']), ProductsController.create);
router.put('/:id', requireRole(['manager']), ProductsController.update);
router.delete('/:id', requireRole(['manager']), ProductsController.delete);

export default router;
