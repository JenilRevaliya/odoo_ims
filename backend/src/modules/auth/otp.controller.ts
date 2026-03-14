import { Request, Response } from 'express';
import { OtpService } from './otp.service';
import { z } from 'zod';
import { logger } from '../../app';

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const verifyOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
});

const resetPasswordSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
  new_password: z.string().min(6),
});

export class OtpController {
  static async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = forgotPasswordSchema.parse(req.body);
      const otp = await OtpService.generateOtp(email);

      // In production: send via SendGrid/email service
      // In development: log to console
      logger.info(`[DEV] OTP for ${email}: ${otp}`);

      res.json({ success: true, data: { message: 'OTP sent to email' } });
    } catch (err: any) {
      // Don't reveal if user exists or not for security
      res.json({ success: true, data: { message: 'If account exists, OTP has been sent' } });
    }
  }

  static async verifyOtp(req: Request, res: Response) {
    try {
      const { email, otp } = verifyOtpSchema.parse(req.body);
      await OtpService.verifyOtp(email, otp);
      res.json({ success: true, data: { verified: true } });
    } catch (err: any) {
      res.status(400).json({ success: false, error: { message: err.message } });
    }
  }

  static async resetPassword(req: Request, res: Response) {
    try {
      const { email, otp, new_password } = resetPasswordSchema.parse(req.body);
      await OtpService.resetPassword(email, otp, new_password);
      res.json({ success: true, data: { message: 'Password reset successfully' } });
    } catch (err: any) {
      res.status(400).json({ success: false, error: { message: err.message } });
    }
  }
}
