"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = __importDefault(require("../../config/db"));
const uuid_1 = require("uuid");
const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh_secret';
class AuthService {
    static async register(data) {
        const { name, email, password } = data;
        const existingUser = await (0, db_1.default)('users').where({ email }).first();
        if (existingUser) {
            throw new Error('Email already exists');
        }
        const passwordHash = await bcrypt_1.default.hash(password, 10);
        const userId = (0, uuid_1.v4)();
        const [user] = await (0, db_1.default)('users').insert({
            id: userId,
            name,
            email,
            password_hash: passwordHash,
            role: 'staff' // Default role
        }).returning(['id', 'name', 'email', 'role']);
        return user;
    }
    static async login(data) {
        const { email, password } = data;
        const user = await (0, db_1.default)('users').where({ email }).first();
        if (!user) {
            throw new Error('Invalid credentials');
        }
        const passwordMatch = await bcrypt_1.default.compare(password, user.password_hash);
        if (!passwordMatch) {
            throw new Error('Invalid credentials');
        }
        const accessToken = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: (process.env.JWT_EXPIRED_IN || '15m') });
        const refreshToken = jsonwebtoken_1.default.sign({ userId: user.id }, JWT_REFRESH_SECRET, { expiresIn: (process.env.JWT_REFRESH_EXPIRED_IN || '7d') });
        return { user: { id: user.id, name: user.name, email: user.email, role: user.role }, accessToken, refreshToken };
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map