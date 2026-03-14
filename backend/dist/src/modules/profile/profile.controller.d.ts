import { Response } from 'express';
import { AuthRequest } from '../../shared/middleware/auth.middleware';
export declare class ProfileController {
    static getProfile(req: AuthRequest, res: Response): Promise<void>;
    static updateProfile(req: AuthRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=profile.controller.d.ts.map