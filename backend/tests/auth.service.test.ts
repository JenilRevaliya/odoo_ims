import { AuthService } from '../src/modules/auth/auth.service';
import db from '../src/config/db';

describe('AuthService', () => {
  beforeAll(async () => {
    // Ensuring basic seed works or wiping specific table logic if needed
  });

  afterAll(async () => {
    // Teardown connections to avoid Jest freezing
    await db.destroy();
  });

  it('should register a new user successfully', async () => {
    const data = {
      name: 'Test Staff',
      email: `test_${Date.now()}@example.com`,
      password: 'password123'
    };

    const user = await AuthService.register(data);
    expect(user).toBeDefined();
    expect(user.id).toBeDefined();
    expect(user.email).toBe(data.email);
    expect(user.role).toBe('staff');
  });

  it('should login correctly and return tokens', async () => {
    const email = `login_${Date.now()}@example.com`;
    await AuthService.register({ name: 'Bob', email, password: 'password123' });

    const result = await AuthService.login({ email, password: 'password123' });
    expect(result).toBeDefined();
    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
    expect(result.user.email).toBe(email);
  });

  it('should throw Error on invalid password', async () => {
    const email = `invalid_${Date.now()}@example.com`;
    await AuthService.register({ name: 'Alice', email, password: 'password456' });

    await expect(AuthService.login({ email, password: 'wrongpassword' })).rejects.toThrow('Invalid credentials');
  });
});
