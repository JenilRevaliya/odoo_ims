import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const data = registerSchema.parse(req.body);
      const user = await AuthService.register(data);
      res.status(201).json({ success: true, data: user });
    } catch (err: any) {
      res.status(400).json({ success: false, error: { message: err.message || 'Invalid Request' } });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const data = loginSchema.parse(req.body);
      const result = await AuthService.login(data);
      // Set refresh token HTTP only cookie
      res.cookie('refresh_token', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
      res.status(200).json({ success: true, data: { user: result.user, accessToken: result.accessToken } });
    } catch (err: any) {
      res.status(400).json({ success: false, error: { message: err.message || 'Invalid Credentials' } });
    }
  }
}
