"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const otp_controller_1 = require("./otp.controller");
const app_1 = require("../../app");
const router = (0, express_1.Router)();
router.use(app_1.authLimiter);
router.post('/signup', auth_controller_1.AuthController.register);
router.post('/login', auth_controller_1.AuthController.login);
// router.post('/logout', AuthController.logout);
// router.post('/refresh', AuthController.refresh);
// OTP Password Reset
router.post('/forgot-password', otp_controller_1.OtpController.forgotPassword);
router.post('/verify-otp', otp_controller_1.OtpController.verifyOtp);
router.post('/reset-password', otp_controller_1.OtpController.resetPassword);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map