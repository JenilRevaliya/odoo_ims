export declare class OtpService {
    /**
     * Generate a 6-digit OTP, hash it, store in DB with 15min TTL.
     * Returns plain OTP (to be emailed or logged in dev).
     */
    static generateOtp(email: string): Promise<string>;
    /**
     * Verify OTP against stored hash.
     * Enforces 3-attempt limit and expiry.
     */
    static verifyOtp(email: string, otp: string): Promise<boolean>;
    /**
     * Reset password after OTP verification.
     */
    static resetPassword(email: string, otp: string, newPassword: string): Promise<{
        reset: boolean;
    }>;
}
//# sourceMappingURL=otp.service.d.ts.map