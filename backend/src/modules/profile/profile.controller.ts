import { Response } from 'express';
import { ProfileService } from './profile.service';
import { AuthRequest } from '../../shared/middleware/auth.middleware';
import { z } from 'zod';

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  current_password: z.string().optional(),
  new_password: z.string().min(6).optional(),
});

export class ProfileController {
  static async getProfile(req: AuthRequest, res: Response) {
    try {
      const profile = await ProfileService.getProfile(req.user!.userId);
      res.json({ success: true, data: profile });
    } catch (err: any) {
      res.status(404).json({ success: false, error: { message: err.message } });
    }
  }

  static async updateProfile(req: AuthRequest, res: Response) {
    try {
      const data = updateProfileSchema.parse(req.body);
      const profile = await ProfileService.updateProfile(req.user!.userId, data);
      res.json({ success: true, data: profile });
    } catch (err: any) {
      res.status(400).json({ success: false, error: { message: err.message } });
    }
  }
}
