"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileService = void 0;
const db_1 = __importDefault(require("../../config/db"));
const bcrypt_1 = __importDefault(require("bcrypt"));
class ProfileService {
    static async getProfile(userId) {
        const user = await (0, db_1.default)('users')
            .select('id', 'name', 'email', 'role', 'created_at')
            .where({ id: userId })
            .first();
        if (!user)
            throw new Error('User not found');
        return user;
    }
    static async updateProfile(userId, data) {
        const user = await (0, db_1.default)('users').where({ id: userId }).first();
        if (!user)
            throw new Error('User not found');
        const updateData = {};
        if (data.name)
            updateData.name = data.name;
        if (data.email) {
            // Check uniqueness
            const existing = await (0, db_1.default)('users').where({ email: data.email }).whereNot({ id: userId }).first();
            if (existing)
                throw new Error('Email already in use');
            updateData.email = data.email;
        }
        if (data.new_password) {
            if (!data.current_password)
                throw new Error('Current password is required to set a new password');
            const match = await bcrypt_1.default.compare(data.current_password, user.password_hash);
            if (!match)
                throw new Error('Current password is incorrect');
            updateData.password_hash = await bcrypt_1.default.hash(data.new_password, 10);
        }
        if (Object.keys(updateData).length === 0)
            throw new Error('No fields to update');
        updateData.updated_at = db_1.default.fn.now();
        await (0, db_1.default)('users').where({ id: userId }).update(updateData);
        return ProfileService.getProfile(userId);
    }
}
exports.ProfileService = ProfileService;
//# sourceMappingURL=profile.service.js.map