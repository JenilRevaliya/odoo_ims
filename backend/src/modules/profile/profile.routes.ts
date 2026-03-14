import { Router } from 'express';
import { ProfileController } from './profile.controller';
import { requireAuth } from '../../shared/middleware/auth.middleware';

const router = Router();

router.use(requireAuth);

router.get('/', ProfileController.getProfile);
router.put('/', ProfileController.updateProfile);

export default router;
