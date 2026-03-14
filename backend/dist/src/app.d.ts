import { Express } from 'express';
import winston from 'winston';
declare const app: Express;
export declare const logger: winston.Logger;
export declare const authLimiter: import("express-rate-limit").RateLimitRequestHandler;
export default app;
//# sourceMappingURL=app.d.ts.map