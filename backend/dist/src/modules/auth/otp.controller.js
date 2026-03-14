"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OtpController = void 0;
const otp_service_1 = require("./otp.service");
const zod_1 = require("zod");
const app_1 = require("../../app");
const forgotPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
});
const verifyOtpSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    otp: zod_1.z.string().length(6),
});
const resetPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    otp: zod_1.z.string().length(6),
    new_password: zod_1.z.string().min(6),
});
class OtpController {
    static async forgotPassword(req, res) {
        try {
            const { email } = forgotPasswordSchema.parse(req.body);
            const otp = await otp_service_1.OtpService.generateOtp(email);
            // In production: send via SendGrid/email service
            // In development: log to console
            app_1.logger.info(`[DEV] OTP for ${email}: ${otp}`);
            res.json({ success: true, data: { message: 'OTP sent to email' } });
        }
        catch (err) {
            // Don't reveal if user exists or not for security
            res.json({ success: true, data: { message: 'If account exists, OTP has been sent' } });
        }
    }
    static async verifyOtp(req, res) {
        try {
            const { email, otp } = verifyOtpSchema.parse(req.body);
            await otp_service_1.OtpService.verifyOtp(email, otp);
            res.json({ success: true, data: { verified: true } });
        }
        catch (err) {
            res.status(400).json({ success: false, error: { message: err.message } });
        }
    }
    static async resetPassword(req, res) {
        try {
            const { email, otp, new_password } = resetPasswordSchema.parse(req.body);
            await otp_service_1.OtpService.resetPassword(email, otp, new_password);
            res.json({ success: true, data: { message: 'Password reset successfully' } });
        }
        catch (err) {
            res.status(400).json({ success: false, error: { message: err.message } });
        }
    }
}
exports.OtpController = OtpController;
//# sourceMappingURL=otp.controller.js.map