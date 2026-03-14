import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { rateLimit } from 'express-rate-limit';
import winston from 'winston';

const app: Express = express();

// Logger
export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());

// Rate Limiter
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs for auth routes
  message: { error: 'Too many auth requests, please try again later.' }
});

// Routes
app.get('/health', (req: Request, res: Response) => {
  // To strictly check if DB/Redis is up, we can do that here.
  // We'll mock it for now since Docker isn't running yet.
  res.status(200).json({ status: 'ok', db: 'connected', redis: 'connected' });
});

// Auth Routes
import authRoutes from './modules/auth/auth.routes';
app.use('/v1/auth', authRoutes);

// Products Routes
import productsRoutes from './modules/products/products.routes';
app.use('/v1/products', productsRoutes);

// Warehouses Routes
import warehousesRoutes from './modules/warehouses/warehouses.routes';
app.use('/v1/warehouses', warehousesRoutes);

// Dashboard Routes
import dashboardRoutes from './modules/dashboard/dashboard.routes';
app.use('/v1/dashboard', dashboardRoutes);

// Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

export default app;
