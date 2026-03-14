"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileController = void 0;
const profile_service_1 = require("./profile.service");
const zod_1 = require("zod");
const updateProfileSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).optional(),
    email: zod_1.z.string().email().optional(),
    current_password: zod_1.z.string().optional(),
    new_password: zod_1.z.string().min(6).optional(),
});
class ProfileController {
    static async getProfile(req, res) {
        try {
            const profile = await profile_service_1.ProfileService.getProfile(req.user.userId);
            res.json({ success: true, data: profile });
        }
        catch (err) {
            res.status(404).json({ success: false, error: { message: err.message } });
        }
    }
    static async updateProfile(req, res) {
        try {
            const data = updateProfileSchema.parse(req.body);
            const profile = await profile_service_1.ProfileService.updateProfile(req.user.userId, data);
            res.json({ success: true, data: profile });
        }
        catch (err) {
            res.status(400).json({ success: false, error: { message: err.message } });
        }
    }
}
exports.ProfileController = ProfileController;
//# sourceMappingURL=profile.controller.js.map