import { Router } from 'express';
import { AuthController } from './auth.controller';
import { authLimiter } from '../../app';

const router = Router();

router.use(authLimiter);

router.post('/signup', AuthController.register);
router.post('/login', AuthController.login);
// router.post('/logout', AuthController.logout);
// router.post('/refresh', AuthController.refresh);

export default router;
