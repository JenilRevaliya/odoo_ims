import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../../config/db';
import { v4 as uuidv4 } from 'uuid';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh_secret';

export class AuthService {
  static async register(data: any) {
    const { name, email, password } = data;

    const existingUser = await db('users').where({ email }).first();
    if (existingUser) {
      throw new Error('Email already exists');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    const [user] = await db('users').insert({
      id: userId,
      name,
      email,
      password_hash: passwordHash,
      role: 'staff' // Default role
    }).returning(['id', 'name', 'email', 'role']);

    return user;
  }

  static async login(data: any) {
    const { email, password } = data;

    const user = await db('users').where({ email }).first();
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      throw new Error('Invalid credentials');
    }

    const accessToken = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: (process.env.JWT_EXPIRED_IN || '15m') as any }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      JWT_REFRESH_SECRET,
      { expiresIn: (process.env.JWT_REFRESH_EXPIRED_IN || '7d') as any }
    );

    return { user: { id: user.id, name: user.name, email: user.email, role: user.role }, accessToken, refreshToken };
  }
}
