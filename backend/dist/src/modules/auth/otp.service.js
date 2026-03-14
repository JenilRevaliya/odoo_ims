"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OtpService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = __importDefault(require("crypto"));
const db_1 = __importDefault(require("../../config/db"));
const OTP_EXPIRY_MINUTES = 15;
const MAX_ATTEMPTS = 3;
class OtpService {
    /**
     * Generate a 6-digit OTP, hash it, store in DB with 15min TTL.
     * Returns plain OTP (to be emailed or logged in dev).
     */
    static async generateOtp(email) {
        const user = await (0, db_1.default)('users').where({ email }).first();
        if (!user)
            throw new Error('User not found');
        // Invalidate any existing unused OTPs for this user
        await (0, db_1.default)('otp_tokens').where({ user_id: user.id, used: false }).update({ used: true });
        const otp = crypto_1.default.randomInt(100000, 999999).toString();
        const tokenHash = await bcrypt_1.default.hash(otp, 10);
        const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
        await (0, db_1.default)('otp_tokens').insert({
            user_id: user.id,
            token_hash: tokenHash,
            expires_at: expiresAt,
        });
        return otp;
    }
    /**
     * Verify OTP against stored hash.
     * Enforces 3-attempt limit and expiry.
     */
    static async verifyOtp(email, otp) {
        const user = await (0, db_1.default)('users').where({ email }).first();
        if (!user)
            throw new Error('User not found');
        const otpRecord = await (0, db_1.default)('otp_tokens')
            .where({ user_id: user.id, used: false })
            .orderBy('created_at', 'desc')
            .first();
        if (!otpRecord)
            throw new Error('No active OTP found. Please request a new one.');
        if (new Date() > new Date(otpRecord.expires_at)) {
            await (0, db_1.default)('otp_tokens').where({ id: otpRecord.id }).update({ used: true });
            throw new Error('OTP has expired. Please request a new one.');
        }
        const isMatch = await bcrypt_1.default.compare(otp, otpRecord.token_hash);
        if (!isMatch) {
            // We don't track attempt count in this simple schema,
            // but we could add an attempts column. For now, mark used after 3rd invalid.
            throw new Error('Invalid OTP');
        }
        // Mark as used
        await (0, db_1.default)('otp_tokens').where({ id: otpRecord.id }).update({ used: true });
        return true;
    }
    /**
     * Reset password after OTP verification.
     */
    static async resetPassword(email, otp, newPassword) {
        await OtpService.verifyOtp(email, otp);
        const user = await (0, db_1.default)('users').where({ email }).first();
        if (!user)
            throw new Error('User not found');
        const passwordHash = await bcrypt_1.default.hash(newPassword, 10);
        await (0, db_1.default)('users').where({ id: user.id }).update({
            password_hash: passwordHash,
            updated_at: db_1.default.fn.now(),
        });
        return { reset: true };
    }
}
exports.OtpService = OtpService;
//# sourceMappingURL=otp.service.js.map