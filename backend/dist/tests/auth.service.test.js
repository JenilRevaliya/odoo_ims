"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth_service_1 = require("../src/modules/auth/auth.service");
const db_1 = __importDefault(require("../src/config/db"));
describe('AuthService', () => {
    beforeAll(async () => {
        // Ensuring basic seed works or wiping specific table logic if needed
    });
    afterAll(async () => {
        // Teardown connections to avoid Jest freezing
        await db_1.default.destroy();
    });
    it('should register a new user successfully', async () => {
        const data = {
            name: 'Test Staff',
            email: `test_${Date.now()}@example.com`,
            password: 'password123'
        };
        const user = await auth_service_1.AuthService.register(data);
        expect(user).toBeDefined();
        expect(user.id).toBeDefined();
        expect(user.email).toBe(data.email);
        expect(user.role).toBe('staff');
    });
    it('should login correctly and return tokens', async () => {
        const email = `login_${Date.now()}@example.com`;
        await auth_service_1.AuthService.register({ name: 'Bob', email, password: 'password123' });
        const result = await auth_service_1.AuthService.login({ email, password: 'password123' });
        expect(result).toBeDefined();
        expect(result.accessToken).toBeDefined();
        expect(result.refreshToken).toBeDefined();
        expect(result.user.email).toBe(email);
    });
    it('should throw Error on invalid password', async () => {
        const email = `invalid_${Date.now()}@example.com`;
        await auth_service_1.AuthService.register({ name: 'Alice', email, password: 'password456' });
        await expect(auth_service_1.AuthService.login({ email, password: 'wrongpassword' })).rejects.toThrow('Invalid credentials');
    });
});
//# sourceMappingURL=auth.service.test.js.map