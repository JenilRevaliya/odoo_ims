import { Router } from 'express';
import { OperationsController } from './operations.controller';
import { requireAuth, requireRole } from '../../shared/middleware/auth.middleware';

const router = Router();

router.use(requireAuth);

// CRUD
router.get('/', OperationsController.list);
router.get('/:id', OperationsController.getById);
router.post('/', OperationsController.create);
router.put('/:id', OperationsController.update);

// State transitions
router.post('/:id/submit', OperationsController.submit);
router.post('/:id/ready', OperationsController.markReady);
router.post('/:id/validate', OperationsController.validate);
router.post('/:id/cancel', OperationsController.cancel); // RBAC enforced inside service

export default router;
