"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("./auth.service");
const zod_1 = require("zod");
const registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(2),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6)
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(1)
});
class AuthController {
    static async register(req, res) {
        try {
            const data = registerSchema.parse(req.body);
            const user = await auth_service_1.AuthService.register(data);
            res.status(201).json({ success: true, data: user });
        }
        catch (err) {
            res.status(400).json({ success: false, error: { message: err.message || 'Invalid Request' } });
        }
    }
    static async login(req, res) {
        try {
            const data = loginSchema.parse(req.body);
            const result = await auth_service_1.AuthService.login(data);
            // Set refresh token HTTP only cookie
            res.cookie('refresh_token', result.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });
            res.status(200).json({ success: true, data: { user: result.user, accessToken: result.accessToken } });
        }
        catch (err) {
            res.status(400).json({ success: false, error: { message: err.message || 'Invalid Credentials' } });
        }
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map