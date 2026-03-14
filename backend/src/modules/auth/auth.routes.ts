import { Router } from 'express';
import { AuthController } from './auth.controller';
import { OtpController } from './otp.controller';
import { authLimiter } from '../../app';

const router = Router();

router.use(authLimiter);

router.post('/signup', AuthController.register);
router.post('/login', AuthController.login);
// router.post('/logout', AuthController.logout);
// router.post('/refresh', AuthController.refresh);

// OTP Password Reset
router.post('/forgot-password', OtpController.forgotPassword);
router.post('/verify-otp', OtpController.verifyOtp);
router.post('/reset-password', OtpController.resetPassword);

export default router;
